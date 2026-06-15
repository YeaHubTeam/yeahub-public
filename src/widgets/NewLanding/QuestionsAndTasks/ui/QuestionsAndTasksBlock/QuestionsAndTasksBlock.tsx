import { useTranslations } from 'next-intl';
import { NewLanding, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './QuestionsAndTasksBlock.module.css';
import { QuestionsAndTasksCard } from '../QuestionsAndTasksCard/QuestionsAndTasksCard';
import { cardsData } from '../../model/questionsTasksCardData';

interface QuestionsAndTasksBlockProps {
	locale: string;
}

export const QuestionsAndTasksBlock = ({ locale }: QuestionsAndTasksBlockProps) => {
	const t = useTranslations(i18Namespace.newLanding);

	return (
		<Flex direction="column" gap="20">
			<Flex direction="column" gap="8" className={styles.head}>
				<Text variant="head3" className={styles.title}>
					{t(NewLanding.QUESTIONS_TASKS_TITLE).toUpperCase()}
				</Text>
				<Text variant="body3-accent" className={styles.description}>
					{t(NewLanding.QUESTIONS_TASKS_DESCRIPTION)}
				</Text>
			</Flex>
			<Flex gap="20" className={styles.cardsRow}>
				{cardsData.map(card => 
					<QuestionsAndTasksCard
						locale={locale}
						key={card.id}
						img={card.img}
						imgClass={card.imgClass}
						titleKey={card.titleKey}
						descriptionKey={card.descriptionKey}
						buttonKey={card.buttonKey}
						link={card.link}
					/>
				)}
			</Flex>
		</Flex>
	);
};
