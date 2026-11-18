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

import styles from './ResetQuestionStudyProgressButton.module.css';

interface ResetQuestionStudyProgressButtonProps {
	isGuest?: boolean;
	isPopover?: boolean;
	variant?: 'tertiary' | 'link-gray';
	checksCount?: number;
	placementTooltip?: Placement;
	offsetTooltip?: number;
	isEmailVerified?: boolean;
	hasPremium?: boolean;
	isLoading?: boolean;
	onReset?: () => void;
}

export const ResetQuestionStudyProgressButton = ({
	isGuest = false,
	isPopover = false,
	variant = 'tertiary',
	checksCount,
	placementTooltip = 'top',
	offsetTooltip = 10,
	isEmailVerified = false,
	hasPremium,
	isLoading = false,
	onReset,
}: ResetQuestionStudyProgressButtonProps) => {
	const t = useTranslations(i18Namespace.questions);
	const progressDisabled = checksCount === 0;
	const tooltipTitle = !isEmailVerified
		? 'tooltip.not.confirmed'
		: hasPremium === false
			? 'tooltip.members.only'
			: 'tooltip.repeat';
	const iconSize = isPopover ? 20 : 24;
	const shouldShowTooltip = !isEmailVerified || hasPremium === false || progressDisabled;
	const isButtonDisabled = checksCount === undefined || isGuest || !onReset || isLoading || !isEmailVerified || hasPremium !== true || progressDisabled;

	const button = (
		<Button
			className={classNames({ [styles.button]: isPopover, [styles.guest]: isGuest }, styles['button-disabled'])}
			preffix={<Icon icon="clockCounterClockwise" color="black-600" size={iconSize} />}
			aria-hidden={isGuest || undefined}
			variant={variant}
			onClick={isButtonDisabled ? undefined : onReset}
			disabled={isButtonDisabled}
			tabIndex={isGuest ? -1 : undefined}
			aria-disabled={isButtonDisabled}
			title={!isGuest && !onReset ? t('actions.notConnected') : undefined}
		>
			{t('repeat')}
		</Button>
	);
	if (isGuest) {
		const message = t('guest.reset');
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
					<Tooltip title={message} placement={placementTooltip} color="violet" offsetTooltip={offsetTooltip} shouldShowTooltip>
						{button}
					</Tooltip>
					</span>
				)}
			</Popover>
		);
	}
	return (
		<Tooltip
			title={t(isPopover && !onReset ? 'actions.notConnected' : tooltipTitle)}
			placement={placementTooltip}
			color="violet"
			offsetTooltip={offsetTooltip}
			shouldShowTooltip={shouldShowTooltip || (isPopover && !onReset)}
		>
			{button}
		</Tooltip>
	);
};
