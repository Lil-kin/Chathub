import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen, within } from '@testing-library/react';

import { createMockFreeSwitchExtensionDetails, createMockVoipOutgoingSession } from '../../../tests/mocks';
import VoipOutgoingView from './VoipOutgoingView';

const wrapper = mockAppRoot().withEndpoint('GET', '/v1/voip-freeswitch.extension.getDetails', () => createMockFreeSwitchExtensionDetails());

const outgoingSession = createMockVoipOutgoingSession();

it('should properly render outgoing view', async () => {
	render(<VoipOutgoingView session={outgoingSession} />, { wrapper: wrapper.build() });

	expect(screen.getByText('Calling...')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: /Device_settings/ })).toBeInTheDocument();
	expect(await screen.findByText('Administrator')).toBeInTheDocument();
});

it('should only enable outgoing actions', () => {
	render(<VoipOutgoingView session={outgoingSession} />, { wrapper: wrapper.build() });

	expect(within(screen.getByTestId('vc-popup-footer')).queryAllByRole('button')).toHaveLength(5);
	expect(screen.getByRole('button', { name: 'Turn_off_microphone' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Hold' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Open_Dialpad' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Transfer_call' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'End_call' })).toBeEnabled();
});

it('should properly interact with the voice call session', () => {
	render(<VoipOutgoingView session={outgoingSession} />, { wrapper: wrapper.build() });

	screen.getByRole('button', { name: 'End_call' }).click();
	expect(outgoingSession.end).toHaveBeenCalled();
});
