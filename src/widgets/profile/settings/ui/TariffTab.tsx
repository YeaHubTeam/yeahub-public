import { useTranslations } from 'next-intl';

import type { SettingsTariffCatalogResult } from '@/entities/subscription/index.server';
import { Subscription, i18Namespace } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Accordion } from '@/shared/ui/Accordion';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Stub } from '@/shared/ui/Stub';
import { Text } from '@/shared/ui/Text';

import { CurrentSubscriptionInfo } from './CurrentSubscriptionInfo';
import type { CurrentSubscriptionView } from './CurrentSubscriptionInfo';
import { PaymentHistory } from './PaymentHistory';
import type { PaymentHistoryController } from './PaymentHistory';
import type { PaymentController } from './SubscribeModal';
import styles from './TariffTab.module.css';
import type { TrialController } from './TrialActivation';
import type { CancellationController } from './UnsubscribeModal';

export type TariffTabProps = {
	catalog: SettingsTariffCatalogResult;
	canStartTrial: boolean;
	currentSubscription: CurrentSubscriptionView;
	paymentHistoryController?: PaymentHistoryController;
	trialController?: TrialController;
	paymentController?: PaymentController;
	cancellationController?: CancellationController;
};
type Tariff = Extract<SettingsTariffCatalogResult, { status: 'success' }>['tariffs'][number];
const order: Tariff['code'][] = ['free', 'month', 'quarter', 'year'];
const colors = {
	free: 'purple-500',
	month: 'purple-700',
	quarter: 'yellow-800',
	year: 'green-750',
} as const;

const TariffCard = ({
	tariff,
	canStartTrial,
	trialController,
	paymentController,
}: {
	tariff: Tariff;
	canStartTrial: boolean;
	trialController?: TrialController;
	paymentController?: PaymentController;
}) => {
	const t = useTranslations(i18Namespace.subscription);
	const { code, finalPrice, pricePerMonth, discount, monthPeriod } = tariff;
	const title =
		code === 'free'
			? t('card.title.free')
			: code === 'year' && monthPeriod % 12 === 0
				? t('card.title.year', { count: monthPeriod / 12 })
				: t('card.title.month', { count: monthPeriod });
	const benefits =
		code === 'free'
			? ([
					['first', true],
					['fourth.free', true],
					['second', false],
					['third', false],
				] as const)
			: ([
					['first', true],
					['second', true],
					['third', true],
					['fourth.paid', true],
				] as const);
	return (
		<article className={styles.tariff} aria-label={title}>
			<div
				className={styles.badge}
				style={{ backgroundColor: `var(--color-${code === 'free' ? 'white-900' : colors[code]})` }}
			>
				{code !== 'free' && (
					<Text variant="body3-accent" color="white-900">
						{code === 'month'
							? t('card.badge.basic')
							: t('card.badge.discount', { count: discount })}
					</Text>
				)}
			</div>
			<Card withOutsideShadow className={styles.card} contentClassName={styles['card-content']}>
				<Flex direction="column" gap="20" justify="between" className={styles['card-content']}>
					<Flex direction="column" gap="14">
						<Flex align="center" gap="10">
							<Icon icon="sealCheck" size={40} color={colors[code]} />
							<Text variant="body6">{title}</Text>
						</Flex>
						{(code !== 'free' || canStartTrial) && (
							<Text variant="body2">{t(`card.subtitle.${code}`)}</Text>
						)}
						<Flex direction="column" gap="4">
							<Flex align="center" gap="10" wrap="wrap">
								<Text variant="body5-strong" color="purple-900">
									{t('card.price.all', { count: finalPrice })}
								</Text>
								{finalPrice > 0 && discount < 100 && (
									<Text variant="body3-accent" color="black-500" className={styles.crossed}>
										{t('card.price.all', { count: finalPrice / (1 - discount / 100) })}
									</Text>
								)}
							</Flex>
							{(code === 'quarter' || code === 'year') && (
								<Text variant="body3-accent" color="purple-900">
									{t('card.price.month', { count: pricePerMonth * (1 - discount / 100) })}
								</Text>
							)}
						</Flex>
					</Flex>
					<Flex direction="column" gap="24">
						{code !== 'free' ? (
							<Button
								type="button"
								fullWidth
								size="large"
								disabled={!paymentController || !paymentController.canOpen(tariff.id)}
								onClick={() => paymentController?.open(tariff.id)}
							>
								{t('card.subscribe')}
							</Button>
						) : (
							canStartTrial && (
								<Button
									type="button"
									fullWidth
									size="large"
									variant="outline"
									disabled={!trialController || trialController.disabled}
									aria-busy={trialController?.pending}
									onClick={trialController?.activate}
								>
									{t(Subscription.SUBSCRIPTION_BUTTON_TRIAL)}
								</Button>
							)
						)}
						<Flex direction="column" gap="14">
							{benefits.map(([key, active]) => (
								<Flex key={key} gap="8" align="center">
									<Icon
										icon="sealCheckOutlined"
										size={20}
										color={active ? 'purple-700' : 'black-500'}
									/>
									<Text variant="body2" className={active ? undefined : styles.crossed}>
										{t(`settings.benefits.${key}`)}
									</Text>
								</Flex>
							))}
						</Flex>
					</Flex>
				</Flex>
			</Card>
		</article>
	);
};

export const TariffTab = ({
	catalog,
	canStartTrial,
	currentSubscription,
	paymentHistoryController,
	trialController,
	paymentController,
	cancellationController,
}: TariffTabProps) => {
	const t = useTranslations(i18Namespace.subscription);
	const { isMobile } = useScreenSize();
	if (currentSubscription)
		return (
			<Flex direction="column" gap="20">
				<CurrentSubscriptionInfo
					subscription={currentSubscription}
					onCancel={cancellationController?.open}
					cancelDisabled={!cancellationController?.canOpen}
				/>
				{paymentHistoryController && <PaymentHistory controller={paymentHistoryController} />}
			</Flex>
		);
	return (
		<Flex direction="column" gap="20">
			<Card withOutsideShadow>
				<Flex direction="column" gap="20">
					<Flex direction="column" gap={isMobile ? '8' : '12'}>
						<Text variant={isMobile ? 'body5-accent' : 'head3'}>{t('title')}</Text>
						<Text variant={isMobile ? 'body2' : 'body3'} className={styles.description}>
							{t('description')}
						</Text>
					</Flex>
					{catalog.status === 'success' ? (
						<div className={styles.grid}>
							{[...catalog.tariffs]
								.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code))
								.map((tariff) => (
									<TariffCard
										key={tariff.id}
										tariff={tariff}
										canStartTrial={canStartTrial}
										trialController={trialController}
										paymentController={paymentController}
									/>
								))}
						</div>
					) : (
						<div role={catalog.status === 'error' ? 'alert' : undefined}>
							<Stub
								type={catalog.status === 'error' ? 'error' : 'access-denied'}
								title={t('stub.hide.tariffs.title')}
								subtitle={t('stub.hide.tariffs.description')}
								buttonText=""
							/>
						</div>
					)}
					<Card withOutsideShadow withBorder>
						<Flex direction="column" gap="6">
							<Text variant="body3-strong" color="black-800">
								{t(Subscription.SUBSCRIPTION_BANNER_TITLE)}
							</Text>
							<Text variant="body2" color="black-700">
								{t('banner.list.title')}
							</Text>
							<Flex componentType="ul" className={styles['banner-list']}>
								{['first', 'fourth', 'second', 'fifth', 'third'].map((key) => (
									<li key={key}>
										<Text variant="body2" color="black-700">
											{t(`banner.list.${key}`)}
										</Text>
									</li>
								))}
								<Text variant="body2-accent" color="black-700" className={styles['banner-thanks']}>
									{t('banner.list.thanks')}
								</Text>
							</Flex>
						</Flex>
					</Card>
				</Flex>
			</Card>
			<Card>
				<Flex direction="column" gap={isMobile ? '16' : '24'}>
					<Text variant={isMobile ? 'body5-accent' : 'head3'}>
						{t(Subscription.SUBSCRIPTION_FAQ_TITLE)}
					</Text>
					<Flex direction="column" gap="12">
						{['first', 'second', 'third', 'fourth'].map((key) => (
							<Accordion
								className={styles.faq}
								titleVariant={isMobile ? 'body3-accent' : 'body5-accent'}
								key={key}
								title={t(`faq.${key}.question`)}
							>
								<Text variant="body3">
									{t(`faq.${key}.answer`, key === 'first' ? { price: 800 } : undefined)}
								</Text>
							</Accordion>
						))}
					</Flex>
				</Flex>
			</Card>
		</Flex>
	);
};
