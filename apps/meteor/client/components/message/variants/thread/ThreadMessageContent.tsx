import type { IThreadMainMessage, IThreadMessage } from '@rocket.chat/core-typings';
import { isE2EEMessage } from '@rocket.chat/core-typings';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useSetting, useUserId, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

import { useUserData } from '../../../../hooks/useUserData';
import type { MessageWithMdEnforced } from '../../../../lib/parseMessageTextToAstMarkdown';
import type { UserPresence } from '../../../../lib/presence';
import { useRoomSubscription } from '../../../../views/room/contexts/RoomContext';
import MessageContentBody from '../../MessageContentBody';
import { useMessageContext } from '../../MessageContext';
import ReadReceiptIndicator from '../../ReadReceiptIndicator';
import Attachments from '../../content/Attachments';
import BroadcastMetrics from '../../content/BroadcastMetrics';
import Location from '../../content/Location';
import MessageActions from '../../content/MessageActions';
import Reactions from '../../content/Reactions';
import UiKitSurface from '../../content/UiKitSurface';
import UrlPreviews from '../../content/UrlPreviews';
import { useOembedLayout } from '../../hooks/useOembedLayout';
import { useTranslateAttachments } from '../../list/MessageListContext';

type ThreadMessageContentProps = {
	message: MessageWithMdEnforced<IThreadMessage | IThreadMainMessage>;
};

const ThreadMessageContent = ({ message }: ThreadMessageContentProps): ReactElement => {
	const encrypted = isE2EEMessage(message);
	const attachments = useTranslateAttachments({ message });
	const {
		actions: { runActionLink },
	} = useMessageContext();
	const { enabled: oembedEnabled } = useOembedLayout();
	const broadcast = useRoomSubscription()?.broadcast ?? false;
	const uid = useUserId();
	const messageUser: UserPresence = { ...message.u, roles: [], ...useUserData(message.u._id) };
	const readReceiptEnabled = useSetting('Message_Read_Receipt_Enabled', false);

	const t = useTranslation();

	return (
		<>
			{!message.blocks?.length && !!message.md?.length && (
				<>
					{(!encrypted || message.e2e === 'done') && (
						<MessageContentBody md={message.md} mentions={message.mentions} channels={message.channels} />
					)}
					{encrypted && message.e2e === 'pending' && t('E2E_message_encrypted_placeholder')}
				</>
			)}

			{message.blocks && <UiKitSurface mid={message._id} blocks={message.blocks} appId rid={message.rid} />}

			{attachments && <Attachments attachments={attachments} file={message.file} />}

			{oembedEnabled && !!message.urls?.length && <UrlPreviews urls={message.urls} />}

			{message.actionLinks?.length && (
				<MessageActions
					mid={message._id}
					actions={message.actionLinks.map(({ method_id: methodId, i18nLabel, ...action }) => ({
						methodId,
						i18nLabel: i18nLabel as TranslationKey,
						...action,
					}))}
					runAction={runActionLink(message)}
				/>
			)}

			{message.reactions && Object.keys(message.reactions).length && <Reactions message={message} />}

			{message.location && <Location location={message.location} />}

			{broadcast && !!messageUser.username && message.u._id !== uid && (
				<BroadcastMetrics mid={message._id} username={messageUser.username} message={message} />
			)}

			{readReceiptEnabled && <ReadReceiptIndicator unread={message.unread} />}
		</>
	);
};

export default memo(ThreadMessageContent);
