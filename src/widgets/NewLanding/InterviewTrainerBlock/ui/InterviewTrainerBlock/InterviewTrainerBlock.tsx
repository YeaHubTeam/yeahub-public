import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { trainer, trainerMobile } from '../../model/assets';
import { statistics } from '../../model/assets';
import { InfoBlock } from '../InfoBlock/InfoBlock';
import styles from './InterviewTrainerBlock.module.css';

export const InterviewTrainerBlock = () => {
	return (
		<section className={styles['interview-trainer']}>
			<div className={styles['title-block']}>
				<Text variant="head4" className={styles.title}>
					{'Тренажёр и прогресс подготовки'.toUpperCase()}
				</Text>
				<Text variant="body3" className={styles.subtitle}>
					{
						'Тренируйся в формате квизов, повторяй вопросы и отслеживай, какие темы уже освоены, а какие ещё требуют практики.'
					}
				</Text>
			</div>
			<Flex gap="20" className={styles['interview-trainer-wrapper']}>
				<InfoBlock
					image={trainer}
					imageMobile={trainerMobile}
					title={'Тренажёр вопросов'}
					text={
						'Проходи вопросы в формате карточек, выбирай режим новых или повторения и закрепляй знания через практику.'
					}
					linkText={'Тренажёр'}
				/>
				<InfoBlock
					image={statistics}
					title={'Прогресс обучения'}
					text={
						'Отслеживай, какие вопросы и темы уже изучены, и контролируй свой уровень подготовки к собеседованиям.'
					}
					linkText={'Прогресс'}
				/>
			</Flex>
		</section>
	);
};
