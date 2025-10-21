import Image from 'next/image';
import Link from 'next/link';

import { getTranslations } from 'next-intl/server';

import { Question, QuestionGradeList } from '@/entities/questions';
import { Questions, ROUTES, i18Namespace } from '@/shared/config';
import { route } from '@/shared/helpers';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { TextHtml } from '@/shared/ui/TextHtml';

import styles from './FullQuestionItem.module.css';

interface FullQuestionItemProps {
	question: Question;
}

export const FullQuestionItem = async ({ question }: FullQuestionItemProps) => {
	const t = await getTranslations(i18Namespace.questions);
	const { id, imageSrc, complexity = 0, rate, shortAnswer } = question;
	const detailRoute = route(ROUTES.questions.detail.page, id);

	return (
		<Flex direction="column" gap="24" className={styles.item}>
			<Flex justify="between" align="center" className={styles.header}>
				<QuestionGradeList
					rate={rate}
					complexity={complexity}
					className={styles['header-params']}
				/>
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

			<Link href={detailRoute} className={styles.link}>
				{t(Questions.QUESTIONS_LINK)}
				<Icon icon="arrowRight" size={24} />
			</Link>
		</Flex>
	);
};
