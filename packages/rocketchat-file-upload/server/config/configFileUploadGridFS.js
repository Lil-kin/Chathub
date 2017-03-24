/* globals FileUpload, UploadFS */
const stream = Npm.require('stream');
const zlib = Npm.require('zlib');
const util = Npm.require('util');
const logger = new Logger('FileUpload');

function ExtractRange(options) {
	if (!(this instanceof ExtractRange)) {
		return new ExtractRange(options);
	}

	this.start = options.start;
	this.stop = options.stop;
	this.bytes_read = 0;

	stream.Transform.call(this, options);
}
util.inherits(ExtractRange, stream.Transform);


ExtractRange.prototype._transform = function(chunk, enc, cb) {
	if (this.bytes_read > this.stop) {
		// done reading
		this.end();
	} else if (this.bytes_read + chunk.length < this.start) {
		// this chunk is still before the start byte
	} else {
		let start, stop;
		if (this.start <= this.bytes_read) {
			start = 0;
		} else {
			start = this.start - this.bytes_read;
		}
		if ((this.stop - this.bytes_read + 1) < chunk.length) {
			stop = this.stop - this.bytes_read + 1;
		} else {
			stop = chunk.length;
		}
		const newchunk = chunk.slice(start, stop);
		this.push(newchunk);
	}
	this.bytes_read += chunk.length;
	cb();
};


const getByteRange = function(header) {
	if (header) {
		const matches = header.match(/(\d+)-(\d+)/);
		if (matches) {
			return {
				start: parseInt(matches[1], 10),
				stop: parseInt(matches[2], 10)
			};
		}
	}
	return null;
};


// code from: https://github.com/jalik/jalik-ufs/blob/master/ufs-server.js#L91
const readFromGridFS = function(storeName, fileId, file, headers, req, res) {
	const store = UploadFS.getStore(storeName);
	const rs = store.getReadStream(fileId, file);
	const ws = new stream.PassThrough();

	rs.on('error', function(err) {
		store.onReadError.call(store, err, fileId, file);
		res.end();
	});
	ws.on('error', function(err) {
		store.onReadError.call(store, err, fileId, file);
		res.end();
	});
	ws.on('close', function() {
		// Close output stream at the end
		ws.emit('end');
	});

	const accept = req.headers['accept-encoding'] || '';

	// Transform stream
	store.transformRead(rs, ws, fileId, file, req, headers);

	const range = getByteRange(req.headers.range);
	let out_of_range = false;
	if (range) {
		out_of_range = (range.start > file.size) || (range.stop <= range.start) || (range.stop > file.size);
	}

	// Compress data using gzip
	if (accept.match(/\bgzip\b/) && range === null) {
		headers['Content-Encoding'] = 'gzip';
		delete headers['Content-Length'];
		res.writeHead(200, headers);
		ws.pipe(zlib.createGzip()).pipe(res);
	} else if (accept.match(/\bdeflate\b/) && range === null) {
		// Compress data using deflate
		headers['Content-Encoding'] = 'deflate';
		delete headers['Content-Length'];
		res.writeHead(200, headers);
		ws.pipe(zlib.createDeflate()).pipe(res);
	} else if (range && out_of_range) {
		// out of range request, return 416
		delete headers['Content-Length'];
		delete headers['Content-Type'];
		delete headers['Content-Disposition'];
		delete headers['Last-Modified'];
		headers['Content-Range'] = `bytes */${ file.size }`;
		res.writeHead(416, headers);
		res.end();
	} else if (range) {
		headers['Content-Range'] = `bytes ${ range.start }-${ range.stop }/${ file.size }`;
		delete headers['Content-Length'];
		headers['Content-Length'] = range.stop - range.start + 1;
		res.writeHead(206, headers);
		logger.debug('File upload extracting range');
		ws.pipe(new ExtractRange({ start: range.start, stop: range.stop })).pipe(res);
	} else {
		res.writeHead(200, headers);
		ws.pipe(res);
	}
};

FileUpload.addHandler('rocketchat_uploads', {
	get(file, req, res) {
		file = FileUpload.addExtensionTo(file);
		const headers = {
			'Content-Disposition': `attachment; filename*=UTF-8''${ encodeURIComponent(file.name) }`,
			'Last-Modified': file.uploadedAt.toUTCString(),
			'Content-Type': file.type,
			'Content-Length': file.size
		};
		return readFromGridFS(file.store, file._id, file, headers, req, res);
	},
	delete(file) {
		return Meteor.fileStore.delete(file._id);
	}
});
