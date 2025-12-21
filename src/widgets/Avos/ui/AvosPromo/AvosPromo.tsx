import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { Avos, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { desktopScreenshot, tabletScreenshot } from '../../model/assets';
import { AvosTelegramLink } from '../AvosTelegramLink/AvosTelegramLink';
import styles from './AvosPromo.module.css';

export const AvosPromo = () => {
	const t = useTranslations(i18Namespace.avos);
	const chips = [
		t(Avos.AVOS_PROMO_CHIPS_REVIEWS),
		t(Avos.AVOS_PROMO_CHIPS_RECORDINGS),
		t(Avos.AVOS_PROMO_CHIPS_BREAKDOWNS),
		t(Avos.AVOS_PROMO_CHIPS_INTERVIEW),
		t(Avos.AVOS_PROMO_CHIPS_GUIDES),
	];

	return (
		<Card className={styles.wrapper} withOutsideShadow>
			<Flex justify="between" gap="20">
				<div>
					<Text variant="body5">{t(Avos.AVOS_PROMO_ABOUT)}</Text>
					<Text variant="body3" className={styles.subtitle}>
						{t(Avos.AVOS_PROMO_LEARN)}
					</Text>
					<Image
						src={tabletScreenshot}
						alt="telegram channel's screenshots"
						className={styles['tablet-screenshot']}
						loading="lazy"
					/>
					<Flex wrap="wrap" className={styles.chips}>
						{chips.map((chip, i) => (
							<Chip className={styles.chip} key={i} label={chip} active />
						))}
					</Flex>
					<Text variant="body3" className={styles.sum}>
						{t(Avos.AVOS_PROMO_SUM)}
					</Text>
					<Text variant="body3" color="black-500" className={styles.sum}>
						{t(Avos.AVOS_PROMO_WARN)}
					</Text>
					<AvosTelegramLink />
				</div>
				<Image
					src={desktopScreenshot}
					alt="telegram channel's screenshots"
					className={styles.screenshot}
					loading="lazy"
				/>
			</Flex>
		</Card>
	);
};
