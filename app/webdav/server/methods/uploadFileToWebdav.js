import { Meteor } from 'meteor/meteor';
import { createClient } from 'webdav';

import { settings } from '../../../settings';
import { getWebdavCredentials } from './getWebdavCredentials';
import { WebdavAccounts } from '../../../models';

Meteor.methods({
	async uploadFileToWebdav(accountId, fileData, name) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid User', { method: 'uploadFileToWebdav' });
		}

		if (!settings.get('Webdav_Integration_Enabled')) {
			throw new Meteor.Error('error-not-allowed', 'WebDAV Integration Not Allowed', { method: 'uploadFileToWebdav' });
		}

		const account = WebdavAccounts.findOne({ _id: accountId });
		if (!account) {
			throw new Meteor.Error('error-invalid-account', 'Invalid WebDAV Account', { method: 'uploadFileToWebdav' });
		}

		const uploadFolder = 'Rocket.Chat Uploads/';
		const buffer = new Buffer(fileData);

		try {
			const cred = getWebdavCredentials(account);
			const client = createClient(account.server_url, cred);
			await client.createDirectory(uploadFolder).catch(() => {});
			await client.putFileContents(`${ uploadFolder }/${ name }`, buffer, { overwrite: false });
			return { success: true };
		} catch (error) {
			if (error.response) {
				const { status } = error.response;
				if (status === 404) {
					return { success: false, message: 'webdav-server-not-found' };
				}
				if (status === 401) {
					return { success: false, message: 'error-invalid-account' };
				}
				if (status === 412) {
					return { success: false, message: 'Duplicate_file_name_found' };
				}
			}
			return { success: false, message: 'FileUpload_Error' };
		}
	},
});
