import Link from 'next/link';

import { getTranslations } from 'next-intl/server';

import { TestQuestion, TestQuestionGradeList } from '@/entities/testQuestion';
import { ROUTES, TestQuestions, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { TextHtml } from '@/shared/ui/TextHtml';

import styles from './FullTestQuestionItem.module.css';

interface FullTestQuestionItemProps {
	question: TestQuestion;
	specialization: string;
	locale: string;
}

export const FullTestQuestionItem = async ({
	question,
	specialization,
	locale,
}: FullTestQuestionItemProps) => {
	const t = await getTranslations(i18Namespace.testQuestions);
	const { id, complexity = 0, rate, description } = question;
	const detailRoute = route(ROUTES.testQuestions.detail.page, locale, specialization, id);

	return (
		<Flex direction="column" gap="24" className={styles.item}>
			<Flex justify="between" align="center" className={styles.header}>
				<TestQuestionGradeList
					rate={rate}
					complexity={complexity}
					className={styles['header-params']}
				/>
			</Flex>

			<TextHtml html={description} />

			<Link href={detailRoute} className={styles.link}>
				{t(TestQuestions.QUESTIONS_LINK)}
				<Icon icon="arrowRight" size={24} />
			</Link>
		</Flex>
	);
};
