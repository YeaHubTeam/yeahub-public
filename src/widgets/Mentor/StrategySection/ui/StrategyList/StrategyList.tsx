import Image from 'next/image';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { strategyList } from '../../model/constants/constants';
import styles from './StrategyList.module.css';

export const StrategyList = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<ul className={styles.grid}>
			{strategyList.map((strategy) => (
				<Card
					key={strategy.id}
					className={styles.card}
					contentClassName={styles['card-content']}
					withOutsideShadow
				>
					{strategy.id !== 'ats' && (
						<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} />
					)}
					{strategy.imgSrc && (
						<Image
							src={strategy.imgSrc}
							alt={t(strategy.imgAlt) ?? ''}
							className={classNames(styles.img, styles[`img-${strategy.id}`])}
						/>
					)}
					<Flex className={styles.texts} direction="column" gap="8">
						<Text variant="head3" className={styles.title}>
							{t(strategy.title)}
						</Text>
						<Text variant="body3">{t(strategy.description)}</Text>
					</Flex>
				</Card>
			))}
		</ul>
	);
};
