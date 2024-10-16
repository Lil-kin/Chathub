import { Divider, Margins } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import { ContextualbarScrollableContent } from '../../../../../components/Contextualbar';
import { useFormatDate } from '../../../../../hooks/useFormatDate';
import CustomField from '../../../components/CustomField';
import Field from '../../../components/Field';
import Info from '../../../components/Info';
import Label from '../../../components/Label';
import ContactInfoDetailsGroup from './ContactInfoDetailsGroup';
import ContactManagerInfo from './ContactManagerInfo';

type ContactInfoDetailsProps = {
	emails?: string[];
	phones?: string[];
	createdAt: string;
	customFieldEntries: [string, string][];
	contactManager?: string;
};

const ContactInfoDetails = ({ emails, phones, createdAt, customFieldEntries, contactManager }: ContactInfoDetailsProps) => {
	const t = useTranslation();
	const formatDate = useFormatDate();

	return (
		<ContextualbarScrollableContent>
			{emails?.length ? <ContactInfoDetailsGroup type='email' label={t('Email')} values={emails} /> : null}
			{phones?.length ? <ContactInfoDetailsGroup type='phone' label={t('Phone_number')} values={phones} /> : null}
			{contactManager && <ContactManagerInfo userId={contactManager} />}
			<Margins block={4}>
				{createdAt && (
					<Field>
						<Label>{t('Created_at')}</Label>
						<Info>{formatDate(createdAt)}</Info>
					</Field>
				)}
				{customFieldEntries.length > 0 && <Divider mi={-24} />}
				{customFieldEntries?.map(([key, value]) => (
					<CustomField key={key} id={key} value={value} />
				))}
			</Margins>
		</ContextualbarScrollableContent>
	);
};

export default ContactInfoDetails;
