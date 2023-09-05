import { Box, Field, FieldError, FieldGroup, FieldHint, FieldLabel, FieldRow, Icon, PasswordInput } from '@rocket.chat/fuselage';
import { useUniqueId } from '@rocket.chat/fuselage-hooks';
import { PasswordVerifier, useValidatePassword } from '@rocket.chat/ui-client';
import { useMethod, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import type { AllHTMLAttributes } from 'react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { useAllowPasswordChange } from './useAllowPasswordChange';

type PasswordFieldValues = { password: string; confirmationPassword: string };

const Password = (props: AllHTMLAttributes<HTMLFormElement>) => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const passwordId = useUniqueId();
	const confirmPasswordId = useUniqueId();
	const passwordVerifierId = useUniqueId();

	const {
		register,
		watch,
		formState: { errors },
		handleSubmit,
		reset,
	} = useFormContext<PasswordFieldValues>();

	const password = watch('password');
	const passwordIsValid = useValidatePassword(password);
	const { allowPasswordChange } = useAllowPasswordChange();

	// FIXME: replace to endpoint
	const updatePassword = useMethod('saveUserProfile');

	const handleSave = async ({ password }: { password?: string }) => {
		try {
			await updatePassword({ newPassword: password }, {});

			dispatchToastMessage({ type: 'success', message: t('Password_changed_successfully') });
			reset();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	};

	return (
		<Box {...props} is='form' autoComplete='off' onSubmit={handleSubmit(handleSave)}>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={passwordId}>{t('New_password')}</FieldLabel>
					<FieldRow>
						<PasswordInput
							id={passwordId}
							{...register('password', {
								validate: () => (password?.length && !passwordIsValid ? t('Password_must_meet_the_complexity_requirements') : true),
							})}
							error={errors.password?.message as string}
							flexGrow={1}
							addon={<Icon name='key' size='x20' />}
							disabled={!allowPasswordChange}
							aria-describedby={`${passwordVerifierId} ${passwordId}-hint ${passwordId}-error`}
							aria-invalid={errors.password ? 'true' : 'false'}
						/>
					</FieldRow>
					{!allowPasswordChange && <FieldHint id={`${passwordId}-hint`}>{t('Password_Change_Disabled')}</FieldHint>}

					{errors?.password && (
						<FieldError aria-live='assertive' id={`${passwordId}-error`}>
							{errors.password.message}
						</FieldError>
					)}
					{allowPasswordChange && <PasswordVerifier password={password} id={passwordVerifierId} />}
				</Field>
				<Field>
					<FieldLabel htmlFor={confirmPasswordId}>{t('Confirm_password')}</FieldLabel>
					<FieldRow>
						<PasswordInput
							id={confirmPasswordId}
							{...register('confirmationPassword', {
								validate: (confirmationPassword) => (password !== confirmationPassword ? t('Passwords_do_not_match') : true),
							})}
							error={errors.confirmationPassword?.message as string}
							flexGrow={1}
							addon={<Icon name='key' size='x20' />}
							disabled={!allowPasswordChange || !passwordIsValid}
							aria-required={password !== '' ? 'true' : 'false'}
							aria-invalid={errors.confirmationPassword ? 'true' : 'false'}
							aria-describedby={`${confirmPasswordId}-error`}
						/>
					</FieldRow>
					{errors.confirmationPassword && (
						<FieldError aria-live='assertive' id={`${confirmPasswordId}-error`}>
							{errors.confirmationPassword.message}
						</FieldError>
					)}
				</Field>
			</FieldGroup>
		</Box>
	);
};

export default Password;
