Package.describe({
	name: 'rocketchat:statistics',
	version: '0.0.1',
	summary: 'Statistics generator',
	git: '',
});

Package.onUse(function(api) {
	api.use([
		'mongo',
		'ecmascript',
		'littledata:synced-cron',
		'accounts-base',
		'rocketchat:migrations',
		'rocketchat:utils',
		'rocketchat:settings',
		'rocketchat:authorization',
		'rocketchat:models',
		'rocketchat:logger',
		'konecty:multiple-instances-status',
	]);
	api.mainModule('client/index.js', 'client');
	api.mainModule('server/index.js', 'server');
});
