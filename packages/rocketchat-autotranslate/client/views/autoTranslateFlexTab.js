/* globals ChatSubscription */
import toastr from 'toastr';

Template.autoTranslateFlexTab.helpers({
	autoTranslate() {
		const sub = ChatSubscription.findOne({
			rid: Template.instance().rid
		}, {
			fields: {
				autoTranslate: 1
			}
		});
		return sub && sub.autoTranslate ? true : false;
	},

	autoTranslateDisplay() {
		const sub = ChatSubscription.findOne({
			rid: Template.instance().rid
		}, {
			fields: {
				autoTranslateDisplay: 1
			}
		});
		return sub && sub.autoTranslateDisplay ? true : false;
	},

	autoTranslateValue() {
		const sub = ChatSubscription.findOne({
			rid: Template.instance().rid
		}, {
			fields: {
				autoTranslate: 1
			}
		});
		return sub && sub.autoTranslate ? t('True') : t('False');
	},

	autoTranslateLanguage() {
		const sub = ChatSubscription.findOne({
			rid: Template.instance().rid
		}, {
			fields: {
				autoTranslateLanguage: 1
			}
		});
		const autoTranslateLanguage = sub && sub.autoTranslateLanguage;
		const supportedLanguages = Template.instance().supportedLanguages.get();
		const language = _.findWhere(supportedLanguages, { language: autoTranslateLanguage });
		return language && language.language || autoTranslateLanguage || (Meteor.user() && Meteor.user().language);
	},

	editing(field) {
		return Template.instance().editing.get() === field;
	},

	supportedLanguages() {
		return Template.instance().supportedLanguages.get();
	},

	languageName(language) {
		const supportedLanguages = Template.instance().supportedLanguages.get();
		language = _.findWhere(supportedLanguages, { language: language });
		return language && language.name;
	}
});

Template.autoTranslateFlexTab.onCreated(function() {
	this.rid = Template.currentData().rid;
	this.editing = new ReactiveVar();
	this.supportedLanguages = new ReactiveVar([]);
	const userLanguage = Meteor.user().language || window.defaultUserLanguage();
	Meteor.call('autoTranslate.getSupportedLanguages', userLanguage, (err, languages) => {
		this.supportedLanguages.set(languages || []);
	});

	this.validateSetting = (field) => {
		let value;
		switch (field) {
			case 'autoTranslate':
			case 'autoTranslateDisplay':
				return true;
			case 'autoTranslateLanguage':
				value = this.$('select[name='+ field +']').val();
				if (!_.findWhere(this.supportedLanguages.get(), { language: value })) {
					toastr.error(t('Invalid_setting_s', value || ''));
					return false;
				}
				return true;
		}
	};

	this.saveSetting = () => {
		const field = this.editing.get();
		const subscription = RocketChat.models.Subscriptions.findOne({ rid: this.rid, 'u._id': Meteor.userId() });
		const previousLanguage = subscription.autoTranslateLanguage;
		let value;
		switch (field) {
			case 'autoTranslate':
			case 'autoTranslateDisplay':
				value = this.$('input[name='+field+']').prop('checked') ? '1' : '0';
				break;
			case 'autoTranslateLanguage':
				value = this.$('select[name='+ field +']').val();
				break;
		}

		if (this.validateSetting(field)) {
			Meteor.call('autoTranslate.saveSettings', this.data.rid, field, value, (err/*, result*/) => {
				if (err) {
					return handleError(err);
				}

				const query = { rid: this.data.rid, 'u._id': { $ne: Meteor.userId() } };
				if (field === 'autoTranslateLanguage') {
					query.$or = [ { [`translations.${previousLanguage}`]: { $exists: 1 } }, { [`translations.${value}`]: { $exists: 1 } } ];
				} else {
					query[`translations.${subscription.autoTranslateLanguage}`] = { $exists: 1 };
				}

				const update = { $set: { random: Random.id() } };

				if (field === 'autoTranslateDisplay' && value === '0') {
					RocketChat.models.Messages.update(query, { $unset: { autoTranslateShowInverse: 1 } }, { multi: true });
				}

				const display = field === 'autoTranslateDisplay' ? true : subscription.autoTranslateDisplay;
				if (display) {
					query.autoTranslateShowInverse = { $ne: true };
				} else {
					query.autoTranslateShowInverse = true;
				}

				console.log(query, RocketChat.models.Messages.find(query).fetch(), update);
				RocketChat.models.Messages.update(query, update, { multi: true });
				this.editing.set();
			});
		}
	};
});

Template.autoTranslateFlexTab.events({
	'keydown input[type=text]'(e, instance) {
		if (e.keyCode === 13) {
			e.preventDefault();
			instance.saveSetting();
		}
	},

	'click [data-edit]'(e, instance) {
		e.preventDefault();
		instance.editing.set($(e.currentTarget).data('edit'));
		setTimeout(function() { instance.$('input.editing').focus().select(); }, 100);
	},

	'change [type=checkbox]'(e, instance) {
		instance.editing.set($(e.currentTarget).attr('name'));
		instance.saveSetting();
	},

	'click .cancel'(e, instance) {
		e.preventDefault();
		instance.editing.set();
	},

	'click .save'(e, instance) {
		e.preventDefault();
		instance.saveSetting();
	}
});
