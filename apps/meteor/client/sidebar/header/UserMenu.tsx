import type { FC } from 'react';
import React, { useState, memo } from 'react';

import GenericMenu from '../../components/GenericMenu';
import type { GenericMenuItemProps } from '../../components/GenericMenuItem';
import { useHandleMenuAction } from '../../hooks/useHandleMenuAction';
import UserAvatarWithStatus from './UserAvatarWithStatus';
import { useUserMenu } from './hooks/useUserMenu';

const UserMenu: FC = () => {
	const [isOpen, setIsOpen] = useState(false);

	const sections = useUserMenu();
	const items = sections.reduce((acc, { items }) => [...acc, ...items], [] as GenericMenuItemProps[]);

	const handleAction = useHandleMenuAction(items, () => setIsOpen(false));

	return (
		<GenericMenu
			icon={<UserAvatarWithStatus />}
			selectionMode='multiple'
			sections={sections}
			title='Menu'
			onAction={handleAction}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
		/>
	);
};

export default memo(UserMenu);
