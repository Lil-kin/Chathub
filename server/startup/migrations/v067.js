RocketChat.Migrations.add({
	version: 67,
	up: function() {
		RocketChat.models.Users.find({}).forEach((user) => {
			RocketChat.models.Messages.updateAllNamesByUserId(user._id, user.name);
			RocketChat.models.Subscriptions.setRealNameForDirectRoomsWithUsername(user.username, user.name);
		});
	}
});
