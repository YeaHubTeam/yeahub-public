import { useTranslations } from 'next-intl';

import { Subscription, i18Namespace } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';
import { getSubscriptionsInfo } from '@/widgets/SubscriptionsList/libs/utils/getSubscriptionsInfo';

import { SubscriptionCard } from '../SubscriptionCard/SubscriptionCard';
import styles from './SubscriptionsList.module.css';

export const SubscriptionsList = () => {
	const t = useTranslations(i18Namespace.subscription);
	const { isMobile } = useScreenSize();

	const subscriptions = getSubscriptionsInfo();

	return (
		<Flex direction="column" gap="20">
			<Flex direction="column" gap={isMobile ? '8' : '12'}>
				<Text variant={isMobile ? 'body5-accent' : 'head2'}>{t(Subscription.TITLE)}</Text>
				<Text className={styles.subtitle} variant={isMobile ? 'body2' : 'body3'}>
					{t(Subscription.DESCRIPTION)}
				</Text>
			</Flex>
			<Flex gap="20" wrap="wrap" className={styles.list}>
				{subscriptions.map((subscription) => (
					<SubscriptionCard key={subscription.id} subscription={subscription} />
				))}
			</Flex>
		</Flex>
	);
};
