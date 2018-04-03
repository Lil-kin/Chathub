/*
* Filter markdown tags in message
*	Use case: notifications
*/
import { RocketChat } from 'meteor/rocketchat:lib';

const filterMarkdownTags = function(message) {
	const schemes = RocketChat.settings.get('Markdown_SupportSchemesForLink').split(',').join('|');

	// Remove block code backticks
	message = message.replace(/```/g, '');

	// Remove inline code backticks
	message = message.replace(new RegExp(/`([^`\r\n]+)\`/gm), (match) => {
		return match.substr(1, match.length - 2);
	});

	// Filter [text](url), ![alt_text](image_url)
	message = message.replace(new RegExp(`!?\\[([^\\]]+)\\]\\((?:${ schemes }):\\/\\/[^\\)]+\\)`, 'gm'), (match, title) => {
		return title;
	});

	// Filter <http://link|Text>
	message = message.replace(new RegExp(`(?:<|&lt;)(?:${ schemes }):\\/\\/[^\\|]+\\|(.+?)(?=>|&gt;)(?:>|&gt;)`, 'gm'), (match, title) => {
		return title;
	});

	// Filter headings
	message = message.replace(/^#{1,4} (([\S\w\d-_\/\*\.,\\][ \u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]?)+)/gm, '$1');

	// Filter bold
	message = message.replace(/(^|&gt;|[ >_~`])\*{1,2}([^\*\r\n]+)\*{1,2}([<_~`]|\B|\b|$)/gm, '$1$2$3');

	// Filter italics
	message = message.replace(/(^|&gt;|[ >*~`])\_{1,2}([^\_\r\n]+)\_{1,2}([<*~`]|\B|\b|$)/gm, '$1$2$3');

	// Filter strike-through text
	message = message.replace(/(^|&gt;|[ >_*`])\~{1,2}([^~\r\n]+)\~{1,2}([<_*`]|\B|\b|$)/gm, '$1$2$3');

	// Filter block quotes
	message = message.replace(/(?:&gt;){3}\n+([\s\S]*?)\n+(?:&lt;){3}/g, '$1');

	// Filter > quote
	message = message.replace(/^&gt;(.*)$/gm, '$1');

	return message;
};

export const filtered = function(message) {
	message = filterMarkdownTags(message);
	return message;
};
