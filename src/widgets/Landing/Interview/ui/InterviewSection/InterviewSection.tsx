import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

import { cardsData } from '../../model/questionsTasksCardData';
import { ListItem } from '../ListItem/ListItem';
import styles from './InterviewSection.module.css';

export const InterviewSection = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<SectionWrapper
			title={t(Landing.INTERVIEW_QUESTIONS_TASKS_TITLE).toUpperCase()}
			subtitle={t(Landing.INTERVIEW_QUESTIONS_TASKS_DESCRIPTION)}
		>
			<Flex gap="20" className={styles['cards-list']}>
				{cardsData.map((card) => (
					<ListItem
						key={card.id}
						img={card.img}
						imgClass={card.imgClass}
						titleKey={card.titleKey}
						descriptionKey={card.descriptionKey}
						buttonKey={card.buttonKey}
						link={card.link}
					/>
				))}
			</Flex>
		</SectionWrapper>
	);
};
