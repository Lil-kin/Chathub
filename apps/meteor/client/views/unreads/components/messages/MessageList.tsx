import { IThreadMessage, IRoom } from '@rocket.chat/core-typings';
import { Box, MessageDivider, Skeleton } from '@rocket.chat/fuselage';
import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import React, { Fragment, memo, ReactElement } from 'react';

import { MessageTypes } from '../../../../../app/ui-utils/client';
import { useFormatDate } from '../../../../hooks/useFormatDate';
import Message from '../../../room/MessageList/components/Message';
import MessageSystem from '../../../room/MessageList/components/MessageSystem';
import { ThreadMessagePreview } from '../../../room/MessageList/components/ThreadMessagePreview';
import { isMessageNewDay } from '../../../room/MessageList/lib/isMessageNewDay';
import { isMessageSequential } from '../../../room/MessageList/lib/isMessageSequential';
import { isOwnUserMessage } from '../../../room/MessageList/lib/isOwnUserMessage';
import { MessageWithMdEnforced } from '../../../room/MessageList/lib/parseMessageTextToAstMarkdown';
import MessageHighlightProvider from '../../../room/MessageList/providers/MessageHighlightProvider';
import { MessageProvider } from '../../../room/providers/MessageProvider';
import { SelectedMessagesProvider } from '../../../room/providers/SelectedMessagesProvider';
import { MessageListProvider } from './MessagesListProvider';

type MessageListProps = {
	rid: IRoom['_id'];
	messages: Array<MessageWithMdEnforced>;
};

export const MessageList = ({ messages, rid }: MessageListProps): ReactElement => {
	const t = useTranslation();
	const messageGroupingPeriod = Number(useSetting('Message_GroupingPeriod'));
	const format = useFormatDate();

	return (
		<MessageListProvider>
			<MessageProvider rid={rid} broadcast={false}>
				<SelectedMessagesProvider>
					<MessageHighlightProvider>
						{!messages.length && (
							<Box is='p' color='hint' fontScale='p2'>
								<Skeleton />
								<Skeleton />
								<Skeleton width='75%' />
							</Box>
						)}
						{messages.map((message: any, index: number, arr: any[]) => {
							const previous = arr[index - 1];
							const { tmid } = message;

							const isSequential = isMessageSequential(message, previous, messageGroupingPeriod);

							const isNewDay = isMessageNewDay(message, previous);
							const shouldShowDivider = isNewDay;

							const shouldShowAsSequential = isSequential && !isNewDay;

							const isSystemMessage = MessageTypes.isSystemMessage(message);
							const shouldShowMessage = !tmid && !isSystemMessage;

							const isUserOwnMessage = isOwnUserMessage(message);

							return (
								<Fragment key={message._id}>
									{shouldShowDivider && (
										<MessageDivider>
											{isNewDay && format(message.ts)}
											{tmid && <Box fontWeight={400}>{t('Reply_in_thread')}</Box>}
										</MessageDivider>
									)}

									{shouldShowMessage && (
										<Message
											id={message._id}
											data-id={message._id}
											data-system-message={Boolean(message.t)}
											data-mid={message._id}
											data-unread={true}
											data-sequential={isSequential}
											data-own={isUserOwnMessage}
											data-qa-type='message'
											sequential={shouldShowAsSequential}
											message={message}
											unread={true}
											mention={true}
											all={true}
											unreadSection={true}
										/>
									)}

									{message.tmid && (
										<ThreadMessagePreview
											data-system-message={Boolean(message.t)}
											data-mid={message._id}
											data-tmid={message.tmid}
											data-unread={true}
											data-sequential={isSequential}
											sequential={shouldShowAsSequential}
											message={message as IThreadMessage}
										/>
									)}

									{isSystemMessage && <MessageSystem message={message} />}
								</Fragment>
							);
						})}
					</MessageHighlightProvider>
				</SelectedMessagesProvider>
			</MessageProvider>
		</MessageListProvider>
	);
};

export default memo(MessageList);
