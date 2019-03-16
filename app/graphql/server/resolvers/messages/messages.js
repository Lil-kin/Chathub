import { Rooms, Messages } from '../../../../models';

import { authenticated } from '../../helpers/authenticated';
import schema from '../../schemas/messages/messages.graphqls';

const resolver = {
	Query: {
		messages: authenticated((root, args, { user }) => {
			const messagesQuery = {};
			const messagesOptions = {
				sort: { ts: -1 },
			};
			const channelQuery = {};
			const isPagination = !!args.cursor || args.count > 0;
			let cursor;

			if (args.channelId) {
				// channelId
				channelQuery._id = args.channelId;
			} else if (args.directTo) {
				// direct message where directTo is a user id
				channelQuery.t = 'd';
				channelQuery.usernames = { $all: [args.directTo, user.username] };
			} else if (args.channelName) {
				// non-direct channel
				channelQuery.t = { $ne: 'd' };
				channelQuery.name = args.channelName;
			} else {
				console.error('messages query must be called with channelId or directTo');
				return null;
			}

			const channel = Rooms.findOne(channelQuery);

			let messagesArray = [];

			if (channel) {
				// cursor
				if (isPagination && args.cursor) {
					const cursorMsg = Messages.findOne(args.cursor, { fields: { ts: 1 } });
					messagesQuery.ts = { $lt: cursorMsg.ts };
				}

				// search
				if (typeof args.searchRegex === 'string') {
					messagesQuery.msg = {
						$regex: new RegExp(args.searchRegex, 'i'),
					};
				}

				// count
				if (isPagination && args.count) {
					messagesOptions.limit = args.count;
				}

				// exclude messages generated by server
				if (args.excludeServer === true) {
					messagesQuery.t = { $exists: false };
				}

				// look for messages that belongs to specific channel
				messagesQuery.rid = channel._id;

				const messages = Messages.find(messagesQuery, messagesOptions);

				messagesArray = messages.fetch();

				if (isPagination) {
					// oldest first (because of findOne)
					messagesOptions.sort.ts = 1;

					const firstMessage = Messages.findOne(messagesQuery, messagesOptions);
					const lastId = (messagesArray[messagesArray.length - 1] || {})._id;

					cursor = !lastId || lastId === firstMessage._id ? null : lastId;
				}
			}

			return {
				cursor,
				channel,
				messagesArray,
			};
		}),
	},
};

export {
	schema,
	resolver,
};
