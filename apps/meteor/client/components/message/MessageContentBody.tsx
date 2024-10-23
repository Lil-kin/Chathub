import { MessageBody, Skeleton } from '@rocket.chat/fuselage';
import { Markup } from '@rocket.chat/gazzodown';
import type { ComponentProps } from 'react';
import React, { Suspense } from 'react';

import type { MessageWithMdEnforced } from '../../lib/parseMessageTextToAstMarkdown';
import GazzodownText from '../GazzodownText';
import shortURLInMessage from './content/actions/MessageURLShortner';

type MessageContentBodyProps = Pick<MessageWithMdEnforced, 'mentions' | 'channels' | 'md'> & {
	searchText?: string;
} & ComponentProps<typeof MessageBody>;

const MessageContentBody = ({ mentions, channels, md, searchText, ...props }: MessageContentBodyProps) => (
	<MessageBody data-qa-type='message-body' dir='auto' {...props}>
		<Suspense fallback={<Skeleton />}>
			<GazzodownText channels={channels} mentions={mentions} searchText={searchText}>
				<Markup tokens={shortURLInMessage(md)} />
			</GazzodownText>
		</Suspense>
	</MessageBody>
);

export default MessageContentBody;
