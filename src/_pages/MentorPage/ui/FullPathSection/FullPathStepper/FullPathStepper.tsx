import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './FullPathStepper.module.css';

const levels = [
	Mentor.FULLPATH_LEVELS_JUNIOR,
	Mentor.FULLPATH_LEVELS_JUNIOR_PLUS,
	Mentor.FULLPATH_LEVELS_MIDDLE,
	Mentor.FULLPATH_LEVELS_MIDDLE_PLUS,
	Mentor.FULLPATH_LEVELS_EVEN_HERE,
];

export const FullPathStepper = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<div className={styles['wrapper-level']}>
			{levels.map((level, index) => (
				<div key={index} className={styles['level']}>
					<div className={styles['level-dot']}>
						{index === levels.length - 1 && (
							<div className={styles['level-text-badge']}>
								<div className={styles['badge']}>
									<Text variant="body2-accent" color="purple-700">
										{t(Mentor.FULLPATH_LEVELS_SENIOR)}
									</Text>
								</div>
							</div>
						)}
						<Text variant="body3-accent" color="black-400" className={styles['level-text']}>
							{t(level)}
						</Text>
					</div>
				</div>
			))}
		</div>
	);
};
