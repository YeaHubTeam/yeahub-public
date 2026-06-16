import { useTranslations } from 'next-intl';

import { NewLanding, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';
import { ListItem } from '@/widgets/NewLanding/InterviewSection/ui/ListItem/ListItem';

import { cardsData } from '../../model/questionsTasksCardData';
import styles from './InterviewSection.module.css';

export const InterviewSection = () => {
	const t = useTranslations(i18Namespace.newLanding);

	return (
		<SectionWrapper
			title={t(NewLanding.QUESTIONS_TASKS_TITLE).toUpperCase()}
			subtitle={t(NewLanding.QUESTIONS_TASKS_DESCRIPTION)}
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
