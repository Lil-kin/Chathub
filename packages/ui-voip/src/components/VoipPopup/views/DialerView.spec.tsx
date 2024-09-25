import '@testing-library/jest-dom';
import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { VoipDialerView } from './DialerView';

const makeCall = jest.fn();
const closeDialer = jest.fn();
jest.mock('../../../hooks/useVoipAPI', () => ({
	useVoipAPI: jest.fn(() => ({ makeCall, closeDialer })),
}));

it('should look good', async () => {
	render(<VoipDialerView />, { wrapper: mockAppRoot().build(), legacyRoot: true });

	expect(screen.getByText('New_Call')).toBeInTheDocument();
	expect(screen.getByTitle('Device_settings')).toBeEnabled();
	expect(screen.getByRole('button', { name: /Call/i })).toBeDisabled();
});

it('should only enable call button if input has value (keyboard)', async () => {
	render(<VoipDialerView />, { wrapper: mockAppRoot().build(), legacyRoot: true });

	expect(screen.getByRole('button', { name: /Call/i })).toBeDisabled();
	await userEvent.type(screen.getByLabelText('Phone_number'), '123');
	expect(screen.getByRole('button', { name: /Call/i })).toBeEnabled();
});

it('should only enable call button if input has value (mouse)', async () => {
	render(<VoipDialerView />, { wrapper: mockAppRoot().build(), legacyRoot: true });

	expect(screen.getByRole('button', { name: /Call/i })).toBeDisabled();
	screen.getByTestId(`dial-pad-button-1`).click();
	screen.getByTestId(`dial-pad-button-2`).click();
	screen.getByTestId(`dial-pad-button-3`).click();
	expect(screen.getByRole('button', { name: /Call/i })).toBeEnabled();
});

it('should call methods makeCall and closeDialer when call button is clicked', async () => {
	render(<VoipDialerView />, { wrapper: mockAppRoot().build(), legacyRoot: true });

	await userEvent.type(screen.getByLabelText('Phone_number'), '123');
	screen.getByTestId(`dial-pad-button-1`).click();
	screen.getByRole('button', { name: /Call/i }).click();
	expect(makeCall).toHaveBeenCalledWith('1231');
	expect(closeDialer).toHaveBeenCalled();
});
