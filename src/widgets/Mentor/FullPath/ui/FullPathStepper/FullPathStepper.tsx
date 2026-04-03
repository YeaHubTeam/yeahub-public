import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './FullPathStepper.module.css';

const levels = ['Junior', 'Junior +', 'Middle', 'Middle +'];

const FullPathStepper = () => {
	const t = useTranslations(i18Namespace.mentor);
	return (
		<Card>
			<div className={styles['level-content']}>
				<Text variant="body3-accent" className={styles['level-title']}>
					{t(Mentor.FULLPATH_LEVELS_TITLE)}
				</Text>
				<Flex direction="column" className={styles['level-right']}>
					<Flex justify="between" align="center">
						<Text variant="body3-accent">{t(Mentor.FULLPATH_LEVELS_SUBTITLE)}</Text>
						<div className={styles['badge']}>
							<Text variant="body2-accent" color="purple-700">
								Senior
							</Text>
						</div>
					</Flex>
					<div className={styles['wrapper-level']}>
						{levels.map((level, index) => (
							<div key={index} className={styles['level']}>
								<div className={styles['level-dot']}>
									<Text variant="body3-accent" color="black-400" className={styles['level-text']}>
										{level}
									</Text>
								</div>
							</div>
						))}
						<div className={styles['level']}>
							<div className={`${styles['level-dot']} ${styles['level-dot-last-child']}`}>
								<Text variant="body3-accent" color="black-400" className={styles['level-text']}>
									{t(Mentor.FULLPATH_LEVELS_EVEN_HERE)}
								</Text>
							</div>
						</div>
					</div>
				</Flex>
			</div>
		</Card>
	);
};

export default FullPathStepper;
