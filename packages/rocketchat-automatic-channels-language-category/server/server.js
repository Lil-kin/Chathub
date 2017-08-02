import {automaticChannelsHandler} from 'meteor/rocketchat:automatic-channels-handler';

import parser from 'accept-language-parser';
import languages from 'languages';

const getLanguage = function(user) {
	let languageName;
	const languagesParsed = parser.parse(user.connection.httpHeaders['accept-language']);
	if (languagesParsed.length===0) {
		languageName = null;
	} else {
		const priorityLanguage = languagesParsed[0].code;
		const browserLanguage = languages.getLanguageInfo(priorityLanguage);
		languageName = browserLanguage.name;
	}

	return languageName;
};


automaticChannelsHandler.addCategory({
	categoryName: 'language',
	getChannelName: getLanguage,
	enable: 'Enable_Language',
	blacklist: 'Blacklist_Language'
});

