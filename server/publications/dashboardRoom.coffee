Meteor.publish 'dashboardRoom', (rid, start) ->
	unless this.userId
		return this.ready()

	# console.log '[publish] dashboardRoom ->'.green, 'rid:', rid, 'start:', start

	if typeof rid isnt 'string'
		return this.ready()

	ChatMessage.find
		rid: rid
		,
			sort:
				ts: -1
			limit: 50
