import { ReactNode } from 'react';

import Link from 'next/link';

import classNames from 'classnames';

import { Icon } from '@/shared/ui/Icon/Icon';
import { Text } from '@/shared/ui/Text';

import { Flex } from '../Flex';
import styles from './Card.module.css';

type CardSize = 'small' | 'medium';

export interface CardProps {
	children?: ReactNode;
	className?: string;
	contentClassName?: string;
	title?: string;
	actionRoute?: string;
	actionTitle?: string;
	actionDisabled?: boolean;
	withShadow?: boolean;
	withOutsideShadow?: boolean;
	withBorder?: boolean;
	isActionPositionBottom?: boolean;
	isTitleCenter?: boolean;
	dataTestId?: string;
	size?: CardSize;
	headerAction?: ReactNode;
}

/**
 * Reusable block component
 * @param { string | ReactNode } children block content
 * @param { string } className className string for custom styles
 */

export const Card = ({
	children,
	className = '',
	contentClassName = '',
	withShadow = false,
	withOutsideShadow = false,
	withBorder = false,
	title = '',
	actionTitle = '',
	actionRoute = '',
	actionDisabled = false,
	isActionPositionBottom = false,
	isTitleCenter = false,
	dataTestId = 'Card',
	size = 'medium',
	headerAction,
}: CardProps) => {
	return (
		<Flex
			dataTestId={dataTestId}
			gap="16"
			direction="column"
			className={classNames(styles.card, className, styles[size], {
				[styles['card-outside-shadow']]: withOutsideShadow,
				[styles.border]: withBorder,
			})}
		>
			{(title || actionRoute) && (
				<div
					className={classNames(styles['card-header'], {
						[styles['card-header-title-center']]: isTitleCenter,
					})}
					data-testid="Card_Header"
				>
					{title && <Text variant="body5-accent">{title}</Text>}
					{actionRoute ? (
						<Link
							href={actionRoute}
							className={classNames(styles.link, {
								[styles['link-bottom']]: isActionPositionBottom,
								[styles['link-disabled']]: actionDisabled,
							})}
						>
							<Text
								variant="body3-strong"
								color={actionDisabled ? 'purple-300' : 'purple-700'}
								dataTestId="Card_Link"
							>
								{actionTitle}
							</Text>
							<Icon
								icon="arrowRight"
								size={24}
								color={actionDisabled ? 'purple-300' : 'purple-700'}
								className={styles.icon}
							/>
						</Link>
					) : null}
					{headerAction}
				</div>
			)}

			<div
				className={classNames(styles.content, contentClassName, {
					[styles['content-shadow']]: withShadow,
					[styles['content-bottom']]: isActionPositionBottom,
					[styles['content-height']]: !actionRoute,
				})}
			>
				{children}
			</div>
		</Flex>
	);
};
