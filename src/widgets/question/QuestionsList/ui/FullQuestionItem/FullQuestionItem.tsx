import Image from 'next/image';
import Link from 'next/link';

import { getTranslations } from 'next-intl/server';

import { QuestionGradeList } from '@/entities/question';
import type { QuestionListItem, QuestionListActions } from '@/entities/question';
import { Questions, ROUTES, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { TextHtml } from '@/shared/ui/TextHtml';

import styles from './FullQuestionItem.module.css';
import { QuestionActionsMenu } from './QuestionActionsMenu';
import type { QuestionActionsMenuState } from './QuestionActionsMenu';

interface FullQuestionItemProps {
	question: QuestionListItem;
	specialization: string;
	locale: string;
	navigationSearch?: string;
	actionsState?: QuestionActionsMenuState;
	actions?: QuestionListActions;
}

export const FullQuestionItem = async ({
	question,
	specialization,
	locale,
	navigationSearch,
	actionsState,
	actions,
}: FullQuestionItemProps) => {
	const t = await getTranslations(i18Namespace.questions);
	const { slug, imageSrc, complexity = 0, rate, shortAnswer } = question;
	const detailRoute = route(ROUTES.questions.detail.page, locale, specialization, slug);

	return (
		<Flex direction="column" gap="24" className={styles.item}>
			<Flex justify="between" align="center" className={styles.header}>
				<QuestionGradeList
					rate={rate}
					complexity={complexity}
					className={styles['header-params']}
				/>
				{actionsState && <QuestionActionsMenu
					questionId={question.id} actions={actions}
					detailHref={navigationSearch ? `${detailRoute}?${navigationSearch}` : detailRoute}
					state={actionsState} />}
			</Flex>

			{imageSrc ? (
				<div className={styles['image-wrapper']}>
					<Image
						className={styles.image}
						alt={'imageAlt'}
						src={imageSrc}
						fill
						sizes="(max-width: 768px) 100vw, 480px"
						priority={false}
					/>
				</div>
			) : null}

			<TextHtml html={shortAnswer} />

			{!actionsState && <Link href={navigationSearch ? `${detailRoute}?${navigationSearch}` : detailRoute} className={styles.link}>
				{t(Questions.QUESTIONS_LINK)}
				<Icon icon="arrowRight" size={24} />
			</Link>}
		</Flex>
	);
};
