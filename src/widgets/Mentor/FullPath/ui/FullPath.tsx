import { FullPathCards, MentorList } from '@/entities/mentor';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './FullPath.module.css';

export const FullPath = () => {
	return (
		<section className="full-path">
			<Flex direction="column" gap="20">
				<div className={styles['full-path-header']}>
					<Flex align="center" gap="16" className={styles['indicator-wrapper']}>
						<span className={styles['indicator']}></span>
						<span>полный путь</span>
					</Flex>
					<Text variant="head3" className={styles['full-path-title']}>
						Любой уровень. Полный путь до результата.
					</Text>
				</div>
				<Card>
					<div className={styles['level-content']}>
						<div>
							Моя цель&nbsp;&mdash; сделать ученика сильным разработчиком, даже без опыта. Полное
							погружение в&nbsp;технологии и&nbsp;реальные проекты.
						</div>
						<Flex direction="column" className={styles['level-right']}>
							<Flex justify="between" align="center">
								<p>Помогаю выйти на&nbsp;работу на&nbsp;любом уровне</p>
								<div className={styles['badge']}>
									<span className={styles['badge-text']}>Senior</span>
								</div>
							</Flex>
							<div className={styles['wrapper-level']}>
								<div className={styles['level']}>
									<div className={styles['level-dot']}>
										<span className={styles['level-text']}>Junior</span>
									</div>
								</div>
								<div className={styles['level']}>
									<div className={styles['level-dot']}>
										<span className={styles['level-text']}>Junior+</span>
									</div>
								</div>
								<div className={styles['level']}>
									<div className={styles['level-dot']}>
										<span className={styles['level-text']}>Middle</span>
									</div>
								</div>
								<div className={styles['level']}>
									<div className={styles['level-dot']}>
										<span className={styles['level-text']}>Middle+</span>
									</div>
								</div>
								<div className={styles['level']}>
									<div className={`${styles['level-dot']} ${styles['level-dot-last-child']}`}>
										<span className={styles['level-text']}>Даже сюда</span>
									</div>
								</div>
							</div>
						</Flex>
					</div>
				</Card>
				<MentorList cards={FullPathCards} />
			</Flex>
		</section>
	);
};
