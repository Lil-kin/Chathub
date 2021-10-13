import { settingsRegister } from '../../settings/server';

settingsRegister.add('HexColorPreview_Enabled', true, {
	type: 'boolean',
	i18nLabel: 'Enabled',
	group: 'Message',
	section: 'Hex_Color_Preview',
	public: true,
});
