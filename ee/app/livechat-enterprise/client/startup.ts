import { Meteor } from 'meteor/meteor';

import { MultipleBusinessHours } from './views/business-hours/Multiple';
import { SingleBusinessHour } from '../../../../app/livechat/client/views/app/business-hours/Single';
import { settings } from '../../../../app/settings/client';
import { businessHourManager } from '../../../../app/livechat/client/views/app/business-hours/BusinessHours';
import { IBusinessHour } from '../../../../app/livechat/client/views/app/business-hours/IBusinessHour';
import {
	addCustomFormTemplate,
	removeCustomTemplate,
} from '../../../../app/livechat/client/views/app/customTemplates/register';
import { LivechatBussinessHourTypes } from '../../../../definition/ILivechatBusinessHour';

const businessHours: Record<string, IBusinessHour> = {
	Multiple: new MultipleBusinessHours(),
	Single: new SingleBusinessHour(),
};

Meteor.startup(function() {
	settings.onload('Livechat_business_hour_type', (_, value) => {
		removeCustomTemplate('livechatBusinessHoursForm');
		console.log(value);
		switch (String(value).toLowerCase()) {
			case LivechatBussinessHourTypes.SINGLE:
				console.log('a');
				businessHourManager.setBusinessHourManager(new SingleBusinessHour() as IBusinessHour);
				break;
			case LivechatBussinessHourTypes.MULTIPLE:
				console.log('b');
				businessHourManager.setBusinessHourManager(new MultipleBusinessHours() as IBusinessHour);
				addCustomFormTemplate('livechatBusinessHoursForm', 'businessHoursCustomFieldsForm');
				break;
		}

		businessHourManager.registerBusinessHourMethod(businessHours[value as string]);
	});
});
