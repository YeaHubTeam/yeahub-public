import Link from 'next/link';

import { Question, QuestionGradeList } from '@/entities/question';
import { ROUTES } from '@/shared/config';
import { route } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { SkillChip } from '@/shared/ui/SkillChip';
import { Text } from '@/shared/ui/Text';

import styles from './InterviewQuestionsItem.module.css';

interface InterviewQuestionsItemProps {
	question: Question;
	specialization: string;
	locale: string;
	titleVariant?: 'body3-accent' | 'body5-accent';
}

export const InterviewQuestionsItem = ({
	question,
	specialization,
	locale,
	titleVariant = 'body5-accent',
}: InterviewQuestionsItemProps) => {
	const { slug, title, rate, complexity, questionSkills } = question;
	const detailRoute = route(ROUTES.questions.detail.page, locale, specialization, slug);

	return (
		<Link href={detailRoute} className={styles.item}>
			<Flex direction="row" justify="between" gap="20" className={styles['item-content']}>
				<Flex direction="column" gap="6">
					<Text variant={titleVariant} className={styles.title}>
						{title}
					</Text>
					<QuestionGradeList rate={rate} complexity={complexity} size="small" />
				</Flex>
				<SkillChip className={styles.skillchip} label={questionSkills[0].title} />
			</Flex>
		</Link>
	);
};
