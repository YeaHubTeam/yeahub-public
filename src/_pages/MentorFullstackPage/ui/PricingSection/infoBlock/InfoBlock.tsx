import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { MentorFullstack, ROUTES, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import styles from './InfoBlock.module.css';

export const InfoBlock = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<div className={styles.wrapper}>
			<Card
				withOutsideShadow
				className={styles['card']}
				contentClassName={styles['wrapper-content']}
			>
				<StatusChip
					size="large"
					status={{ text: t(MentorFullstack.PRICING_INFO_BADGE_INSTEAD), variant: 'green' }}
				/>
				<Text variant="body6" className={styles.title}>
					{t(MentorFullstack.PRICING_INFO_POSTPAY_TITLE)}
				</Text>
				<Text variant="body3-accent" className={styles.description}>
					{t(MentorFullstack.PRICING_INFO_POSTPAY_DESCRIPTION)}
				</Text>
				<Button
					size="large"
					fullWidth
					className={styles.button}
					href={ROUTES.mentor.telegram}
					target="_blank"
					rel="noopener noreferrer"
				>
					{t(MentorFullstack.PRISING_CONSULTATION_BUTTON)}
				</Button>
			</Card>
			<Card
				withOutsideShadow
				className={classNames(styles.card, styles.background)}
				contentClassName={styles['wrapper-content']}
			>
				<Flex maxHeight gap="32">
					<Flex direction="column" maxHeight flex={1}>
						<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} />
						<Text variant="body6" className={styles.title}>
							{t(MentorFullstack.PRICING_INFO_EXPERIENCED_TITLE)}
						</Text>
						<Text
							variant="body3-accent"
							className={classNames(styles.description, styles['description-width'])}
						>
							{t(MentorFullstack.PRICING_INFO_EXPERIENCED_DESCRIPTION)}
						</Text>
						<Button
							size="large"
							fullWidth
							className={styles.button}
							href={ROUTES.mentor.telegram}
							target="_blank"
							rel="noopener noreferrer"
						>
							{t(MentorFullstack.PRISING_CONSULTATION_BUTTON)}
						</Button>
					</Flex>
					<Flex align="start" className={styles['badges']} flex={1}>
						<div className={styles['badge-red']}>
							<Text variant="head2" color="white-900" className={styles['badge-red-text']}>
								150%
							</Text>
							<Text variant="body3" color="white-900" className={styles['badge-red-subtext']}>
								{t(MentorFullstack.PRICING_INFO_BADGE_OFFER)}
							</Text>
						</div>
						<div className={styles['badge-outline']}>
							<Text variant="head2" color="purple-900" className={styles['badge-outline-text']}>
								100%
							</Text>
							<Text variant="body3" color="black-700" className={styles['badge-outline-subtext']}>
								{t(MentorFullstack.PRICING_INFO_BADGE_POSTPAY)}
							</Text>
						</div>
					</Flex>
				</Flex>
			</Card>
		</div>
	);
};
