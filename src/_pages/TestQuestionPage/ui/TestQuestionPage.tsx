import { useTranslations } from 'next-intl';

import type { TestQuestion } from '@/entities/testQuestion';
import { Questions, i18Namespace } from '@/shared/config';
import { BackButton } from '@/shared/ui/BackButton';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import styles from './TestQuestionPage.module.css';

interface TestQuestionPageProps {
	question: TestQuestion;
}

export const TestQuestionPage = ({ question }: TestQuestionPageProps) => {
	const t = useTranslations(i18Namespace.questions);
	const imageSrc = question.imageSrc || question.questionSkills[0]?.imageSrc;

	return (
		<Flex direction="column" gap="20" className={styles.page}>
			<Flex>
				<BackButton />
			</Flex>
			<Card withOutsideShadow className={styles.header}>
				<Flex gap="10" align="start" className={styles['header-content']}>
					<ImageWithWrapper className={styles.image} src={imageSrc} alt={question.title} />
					<Flex direction="column" gap="8" className={styles.details}>
						<Text variant="body6" color="black-800" isMainTitle className={styles.title}>
							{question.title}
						</Text>
						{question.description && (
							<Text variant="body3" color="black-800" className={styles.description}>
								{question.description}
							</Text>
						)}
					</Flex>
				</Flex>
			</Card>
			<Card
				withOutsideShadow
				titleComponent={
					<Text variant="head2" color="black-800" className={styles['answers-title']}>
						{t(Questions.ANSWER_VARIANTS_TITLE)}
					</Text>
				}
			>
				<Flex componentType="ol" direction="column" gap="24" className={styles.variants}>
					{Object.entries(question.variants).map(([key, value]) => (
						<li key={key} className={styles.variant}>
							{value}
						</li>
					))}
				</Flex>
			</Card>
		</Flex>
	);
};
