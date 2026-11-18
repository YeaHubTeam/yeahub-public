'use client';

import type { Placement } from '@floating-ui/react';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Popover } from '@/shared/ui/Popover';
import { Text } from '@/shared/ui/Text';
import { Tooltip } from '@/shared/ui/Tooltip';

import styles from './FavoriteQuestionButton.module.css';

export const FavoriteQuestionButton = ({
	isGuest = false,
	isFavorite = false,
	disabled,
	onClick,
	variant = 'tertiary',
	isPopover = false,
	placementTooltip = 'top',
	offsetTooltip = 10,
}: {
	isGuest?: boolean;
	isFavorite?: boolean;
	disabled: boolean;
	onClick?: () => void;
	isPopover?: boolean;
	placementTooltip?: Placement;
	offsetTooltip?: number;
	variant?: 'tertiary' | 'link-gray';
}) => {
	const t = useTranslations(i18Namespace.questions);
	const activate = () => {
		if (!disabled && !isGuest) onClick?.();
	};
	const button = (
		<Button
			className={classNames({ [styles.button]: isPopover, [styles.red]: isFavorite, [styles.guest]: isGuest })}
			preffix={
				<Icon
					icon={isFavorite ? 'favoriteRed' : 'favorite'}
					color={isFavorite ? 'red-800' : 'black-600'}
					size={isPopover ? 20 : 24}
				/>
			}
			aria-hidden={isGuest || undefined}
			variant={variant}
			onClick={activate}
			disabled={disabled || isGuest || !onClick}
			aria-disabled={disabled || isGuest || !onClick}
			aria-pressed={isPopover && !onClick ? undefined : isFavorite}
			role="button"
			tabIndex={disabled || isGuest ? -1 : 0}
			onKeyDown={(e) => {
				if (variant === 'link-gray' && (e.key === 'Enter' || e.key === ' ')) {
					e.preventDefault();
					activate();
				}
			}}
		>
			{t('favorite')}
		</Button>
	);
	if (isGuest) {
		const message = t('guest.favorite');
		return (
			<Popover body={<Text variant="body3-accent">{message}</Text>} ariaLabel={message} placement="top">
				{({ onToggle, isOpen }) => (
					<span
						className={styles['guest-trigger']}
						role="button"
						tabIndex={0}
						aria-label={message}
						aria-expanded={isOpen}
						onClick={onToggle}
						onKeyDown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								onToggle();
							}
						}}
					>
					<Tooltip title={message} placement="top" color="violet" offsetTooltip={10} shouldShowTooltip>
						{button}
					</Tooltip>
					</span>
				)}
			</Popover>
		);
	}
	return (
		<Tooltip
			title={t(isPopover && !onClick ? 'actions.notConnected' : isFavorite ? 'tooltip.favorite.delete' : 'tooltip.favorite.add')}
			placement={placementTooltip}
			color="violet"
			offsetTooltip={offsetTooltip}
			shouldShowTooltip
		>
			{button}
		</Tooltip>
	);
};
