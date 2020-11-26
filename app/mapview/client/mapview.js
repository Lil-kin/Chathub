import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { settings } from '../../settings';
import { callbacks } from '../../callbacks';

const createMapViewMessageRenderer = ({ googleMapsApiKey }) => {
	const renderMap = (latitude, longitude) => {
		const altText = TAPi18n.__('Shared_Location');

		if (!googleMapsApiKey) {
			return altText;
		}

		const imgUrl = `https://maps.googleapis.com/maps/api/staticmap?zoom=14&size=250x250&markers=color:gray%7Clabel:%7C${ latitude },${ longitude }&key=${ googleMapsApiKey }`;

		return `<img src="${ imgUrl }" alt="${ altText }" />`;
	};

	return (message) => {
		if (!message.location) {
			return message;
		}

		const [longitude, latitude] = message.location.coordinates;

		const mapUrl = `https://maps.google.com/maps?daddr=${ latitude },${ longitude }`;
		message.html = `<a href="${ mapUrl }" target="_blank">${ renderMap(latitude, longitude)	}</a>`;

		return message;
	};
};

Meteor.startup(() => {
	Tracker.autorun(() => {
		const renderMessage = createMapViewMessageRenderer({
			googleMapsApiKey: settings.get('MapView_GMapsAPIKey'),
		});

		callbacks.add('renderMessage', renderMessage, callbacks.priority.HIGH, 'mapview');
	});
});
