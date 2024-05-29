import type { ISetting, ISettingColor, ISettingSelectOption } from '@rocket.chat/core-typings';
import type { FindCursor, UpdateFilter, UpdateResult, Document, FindOptions, FindOneAndUpdateOptions, ModifyResult, UpdateOptions } from 'mongodb';

import type { IBaseModel } from './IBaseModel';

export interface ISettingsModel extends IBaseModel<ISetting> {
	getValueById(_id: string): Promise<ISetting['value'] | undefined>;

	findNotHidden(params?: { updatedAfter?: Date }): FindCursor<ISetting>;

	findOneNotHiddenById(_id: string): Promise<ISetting | null>;

	findByIds(_id?: string[] | string, options?: FindOptions<ISetting>): FindCursor<ISetting>;

	updateValueById(
		_id: string,
		value: (ISetting['value'] extends undefined ? never : ISetting['value']) | null,
		options?: UpdateOptions,
	): Promise<Document | UpdateResult>;

	resetValueById(
		_id: string,
		value?: (ISetting['value'] extends undefined ? never : ISetting['value']) | null,
	): Promise<Document | UpdateResult | undefined>;

	incrementValueById(_id: ISetting['_id'], value?: ISetting['value'], options?: FindOneAndUpdateOptions): Promise<ModifyResult<ISetting>>;

	updateOptionsById<T extends ISetting = ISetting>(
		_id: ISetting['_id'],
		options: UpdateFilter<T>['$set'],
	): Promise<Document | UpdateResult>;

	updateValueNotHiddenById<T extends ISetting['value'] = ISetting['value']>(
		_id: ISetting['_id'],
		value: T,
	): Promise<Document | UpdateResult>;

	updateValueAndEditorById<T extends ISetting['value'] = ISetting['value']>(
		_id: ISetting['_id'],
		value: T,
		editor: ISettingColor['editor'],
	): Promise<Document | UpdateResult>;

	findNotHiddenPublic<T extends ISetting = ISetting>(
		ids?: ISetting['_id'][],
	): FindCursor<
		T extends ISettingColor
			? Pick<T, '_id' | 'value' | 'editor' | 'enterprise' | 'invalidValue' | 'modules' | 'requiredOnWizard'>
			: Pick<T, '_id' | 'value' | 'enterprise' | 'invalidValue' | 'modules' | 'requiredOnWizard'>
	>;

	findSetupWizardSettings(): FindCursor<ISetting>;

	findEnterpriseSettings(): FindCursor<ISetting>;

	addOptionValueById(_id: ISetting['_id'], option: ISettingSelectOption): Promise<Document | UpdateResult>;

	findNotHiddenPublicUpdatedAfter(updatedAt: Date): FindCursor<ISetting>;
}
