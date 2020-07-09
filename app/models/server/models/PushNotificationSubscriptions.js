import { Base } from './_Base';

export class PushNotificationSubscriptions extends Base {
	constructor(...args) {
		super(...args);

		this.tryEnsureIndex({ u: 1 });
	}

	createWithUserAndSubscription(user, subscription) {
		const pushNotificationSubscription = {
			...subscription,
		};
		if (user && user._id != null) {
			pushNotificationSubscription.u = { ...user };
		}
		const result = this.insert(pushNotificationSubscription);
		return result;
	}

	findByUserId(userId) {
		const query = {
			'u._id': userId,
		};
		return this.find(query);
	}

	findSubscriptionsWithNoUser() {
		const query = {
			user: {
				$exists: false,
			},
		};
		return this.find(query);
	}

	updateUserIdWithSubscriptionEndpoint(endpoint, user = null) {
		const query = {
			endpoint,
		};

		const update = {};

		if (user !== null) {
			update.$set = { u: user };
		} else {
			update.$unset = { u: 1 };
		}

		return this.update(query, update);
	}
}

export default new PushNotificationSubscriptions('pushNotificationSubscriptions');
