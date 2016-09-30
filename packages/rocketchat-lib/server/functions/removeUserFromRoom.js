RocketChat.removeUserFromRoom = function(rid, user) {
	let room = RocketChat.cache.Rooms.findOneById(rid);

	if (room) {
		RocketChat.callbacks.run('beforeLeaveRoom', user, room);
		RocketChat.models.Rooms.removeUsernameById(rid, user.username);

		if (room.usernames.indexOf(user.username) !== -1) {
			let removedUser = user;
			RocketChat.models.Messages.createUserLeaveWithRoomIdAndUser(rid, removedUser);
		}

		if (room.t === 'l') {
			RocketChat.models.Messages.createCommandWithRoomIdAndUser('survey', rid, user);
		}

		RocketChat.models.Subscriptions.removeByRoomIdAndUserId(rid, user._id);

		Meteor.defer(function() {
			RocketChat.callbacks.run('afterLeaveRoom', user, room);
		});
	}
};
