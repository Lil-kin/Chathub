import http from 'http';
import https from 'https';

import _ from 'underscore';

import { FileUploadClass, FileUpload } from '../lib/FileUpload';
import { settings } from '../../../settings';
import '../../ufs/GoogleStorage/server.js';

const get = function(file, req, res) {
	const download = typeof req.query.download !== 'undefined';

	this.store.getRedirectURL(file, download, (err, fileUrl) => {
		if (err) {
			console.error(err);
		}

		if (fileUrl) {
			const storeType = file.store.split(':').pop();
			if (settings.get(`FileUpload_GoogleStorage_Proxy_${ storeType }`)) {
				const request = /^https:/.test(fileUrl) ? https : http;
				request.get(fileUrl, (fileRes) => fileRes.pipe(res));
			} else {
				res.removeHeader('Content-Length');
				res.removeHeader('Cache-Control');
				res.setHeader('Location', fileUrl);
				res.writeHead(302);
				res.end();
			}
		} else {
			res.end();
		}
	});
};

const copy = function(file, out) {
	this.store.getRedirectURL(file, false, (err, fileUrl) => {
		if (err) {
			console.error(err);
		}

		if (fileUrl) {
			const request = /^https:/.test(fileUrl) ? https : http;
			request.get(fileUrl, (fileRes) => fileRes.pipe(out));
		} else {
			out.end();
		}
	});
};

const GoogleCloudStorageUploads = new FileUploadClass({
	name: 'GoogleCloudStorage:Uploads',
	get,
	copy,
	// store setted bellow
});

const GoogleCloudStorageAvatars = new FileUploadClass({
	name: 'GoogleCloudStorage:Avatars',
	get,
	copy,
	// store setted bellow
});

const GoogleCloudStorageUserDataFiles = new FileUploadClass({
	name: 'GoogleCloudStorage:UserDataFiles',
	get,
	copy,
	// store setted bellow
});

const configure = _.debounce(function() {
	const bucket = settings.get('FileUpload_GoogleStorage_Bucket');
	const accessId = settings.get('FileUpload_GoogleStorage_AccessId');
	const secret = settings.get('FileUpload_GoogleStorage_Secret');
	const URLExpiryTimeSpan = settings.get('FileUpload_S3_URLExpiryTimeSpan');

	if (!bucket || !accessId || !secret) {
		return;
	}

	const config = {
		connection: {
			credentials: {
				client_email: accessId,
				private_key: secret,
			},
		},
		bucket,
		URLExpiryTimeSpan,
	};

	GoogleCloudStorageUploads.store = FileUpload.configureUploadsStore('GoogleStorage', GoogleCloudStorageUploads.name, config);
	GoogleCloudStorageAvatars.store = FileUpload.configureUploadsStore('GoogleStorage', GoogleCloudStorageAvatars.name, config);
	GoogleCloudStorageUserDataFiles.store = FileUpload.configureUploadsStore('GoogleStorage', GoogleCloudStorageUserDataFiles.name, config);
}, 500);

settings.get(/^FileUpload_GoogleStorage_/, configure);
