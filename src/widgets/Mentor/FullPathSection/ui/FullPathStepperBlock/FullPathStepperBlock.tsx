import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { FullPathStepper } from '../FullPathStepper/FullPathStepper';
import styles from './FullPathStepperBlock.module.css';

const FullPathStepperBlock = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Card>
			<div className={styles['level-content']}>
				<Text variant="body3-accent" className={styles['level-title']}>
					{t(Mentor.FULLPATH_LEVELS_TITLE)}
				</Text>
				<Flex direction="column" className={styles['level-right']}>
					<Text variant="body3-accent">{t(Mentor.FULLPATH_LEVELS_SUBTITLE)}</Text>
					<FullPathStepper />
				</Flex>
			</div>
		</Card>
	);
};

export default FullPathStepperBlock;
