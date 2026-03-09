import { Fragment } from 'react';

import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import { Tooltip } from '../../Tooltip';
import { PopoverMenuItem } from '../types';
import styles from './PopoverMenu.module.css';

interface PopoverMenuProps {
	menuItems: PopoverMenuItem[];
	onToggleOpenPopover: () => void;
}

export const PopoverMenu = ({ menuItems, onToggleOpenPopover }: PopoverMenuProps) => {
	return (
		<Flex direction="column" gap="4">
			{menuItems.map(
				({ icon, onClick, title, renderComponent, disabled, tooltip, link }, index) => (
					<Fragment key={index}>
						{title && (onClick || link) ? (
							<Tooltip
								title={tooltip?.text}
								placement={'left'}
								color={tooltip?.color}
								offsetTooltip={10}
								shouldShowTooltip={!!(disabled && tooltip?.text)}
							>
								{' '}
								<Button
									onClick={() => {
										onClick?.();
										onToggleOpenPopover();
									}}
									variant="tertiary-link"
									preffix={icon}
									disabled={disabled}
									href={link}
									rel="noopener noreferrer"
									target="_blank"
									className={link ? styles.link : undefined}
								>
									{title}
								</Button>
							</Tooltip>
						) : (
							renderComponent?.(onToggleOpenPopover)
						)}
					</Fragment>
				),
			)}
		</Flex>
	);
};
