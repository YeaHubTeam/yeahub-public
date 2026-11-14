import { useTranslations } from 'next-intl';

import { Subscription, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/Text';

import styles from './CurrentSubscriptionInfo.module.css';

export type CurrentSubscriptionView = {
	state: 'active' | 'canceled';
	daysLeft: number;
	daysInCreationMonth: number;
	endDateLabel: string;
} | null;

export const CurrentSubscriptionInfo = ({
	subscription,
	onCancel,
	cancelDisabled = false,
}: {
	onCancel?: () => void;
	cancelDisabled?: boolean;
	subscription: NonNullable<CurrentSubscriptionView>;
}) => {
	const t = useTranslations(i18Namespace.subscription);
	return (
		<div className={styles.wrapper}>
			<Flex direction="column" gap="20">
				<Flex direction="column" gap="12">
					<Flex align="center" gap="12">
						<Icon icon="sealCheck" size={28} color="yellow-900" className={styles.icon} />
						<Text variant="head3">{t(Subscription.TARIFF_PREMIUM)}</Text>
					</Flex>
					<Text variant="body3">{t(Subscription.SUBSCRIPTION_GREETING)}</Text>
				</Flex>
				<ProgressBar
					currentCount={subscription.daysLeft}
					totalCount={subscription.daysInCreationMonth}
					variant="large"
					label={t(Subscription.DAYS_LEFT, { count: subscription.daysLeft })}
				/>
				<Text variant="body3">
					{t(
						subscription.state === 'active'
							? Subscription.SUBSCRIPTION_RENEWAL
							: Subscription.SUBSCRIPTION_CANCELED,
						{ Date: subscription.endDateLabel },
					)}
				</Text>
			</Flex>
			{subscription.state === 'active' && (
				<div className={styles.actions}>
					<Button
						type="button"
						variant="destructive-outline"
						disabled={!onCancel || cancelDisabled}
						onClick={onCancel}
					>
						{t(Subscription.CANCEL_SUBSCRIPTION)}
					</Button>
				</div>
			)}
		</div>
	);
};
