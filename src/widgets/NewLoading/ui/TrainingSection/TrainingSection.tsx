import { useTranslations } from 'next-intl';

import { NewLanding, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TrainingList } from '../TrainingList/TrainingList';
import styles from './TrainingSection.module.css';

export const TrainingSection = () => {
	const t = useTranslations(i18Namespace.newLanding);

	return (
		<section>
			<Flex direction="column" gap="20">
				<Flex direction="column" gap="8" className={styles['header-wrapper']}>
					<Text variant="body5-accent" className={styles.title}>
						{t(NewLanding.TRAINING_TITLE)}
					</Text>
					<Text variant="body3-accent">{t(NewLanding.TRAINING_DESCRIPTION)}</Text>
				</Flex>

				<TrainingList />
			</Flex>
		</section>
	);
};
