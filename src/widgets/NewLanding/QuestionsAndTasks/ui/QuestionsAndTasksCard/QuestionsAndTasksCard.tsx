import Image, { StaticImageData } from 'next/image';

import { useTranslations } from 'next-intl';
import { i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { QuestionsAndTasksCardButton } from '../QuestionsAndTasksCardButton/QuestionsAndTasksCardButton';
import styles from './QuestionsAndTasksCard.module.css';

interface QuestionsAndTasksCardProprs {
	locale: string;
	img: StaticImageData;
	imgClass: string;
	titleKey: string;
	descriptionKey: string;
	buttonKey: string;
	link: string;
}

export const QuestionsAndTasksCard = ({
	img,
	imgClass,
	titleKey,
	descriptionKey,
	buttonKey,
	link,
	locale,
}: QuestionsAndTasksCardProprs) => {
	const t = useTranslations(i18Namespace.newLanding);
	return (
		<div className={styles.card}>
			<Flex direction="column" className={styles.cardContent}>
				<div className={`${styles.cardImg} ${styles[imgClass]}`}>
					<Image src={img} alt="interviewBanner" />
				</div>
				<div className={styles.cardsIndicator}></div>
				<Flex gap="8" direction="column" className={styles.text}>
					<Text variant="head3" color="black-900" className={styles.cardTitle}>
						{t(titleKey)}
					</Text>
					<Text variant="body3-accent" color="black-900">
						{t(descriptionKey)}
					</Text>
				</Flex>
				<QuestionsAndTasksCardButton className={styles.cardButton} link={`/${locale}/${link}`}>
					{t(buttonKey)}
				</QuestionsAndTasksCardButton>
			</Flex>
		</div>
	);
};
