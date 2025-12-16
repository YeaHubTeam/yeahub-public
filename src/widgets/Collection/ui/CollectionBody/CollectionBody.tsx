import { useTranslations } from 'next-intl';

import { Collection, CollectionWarningInfo } from '@/entities/collection';
import { PreviewQuestionsItem, Question } from '@/entities/question';
import { Questions, i18Namespace } from '@/shared/config';
import { ROUTES } from '@/shared/config';
import { SPEC_MAP } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { SimpleStub } from '@/shared/ui/SimpleStub';

import { RegistrationBanner } from '../RegistrationBanner/RegistrationBanner';
import styles from './CollectionBody.module.css';

const GUEST_QUESTIONS_COUNT = 5;

interface CollectionBodyProps extends Pick<Collection, 'isFree'> {
	questions: Question[];
	specialization: keyof typeof SPEC_MAP;
}

export const CollectionBody = ({ questions, isFree, specialization }: CollectionBodyProps) => {
	const t = useTranslations(i18Namespace.questions);

	const link = ROUTES.settings.page + '#select-tariff';

	const showRegistrationBanner = questions.length > GUEST_QUESTIONS_COUNT;
	const hiddenQuestionsCount = questions.length - GUEST_QUESTIONS_COUNT;
	const displayedQuestions = questions?.slice(0, GUEST_QUESTIONS_COUNT) || [];

	if (!isFree)
		return (
			<Card
				className={styles.wrapper}
				title={t(Questions.PREVIEW_TITLE)}
				actionRoute={link}
				actionTitle={t(Questions.COMMUNITY_JOIN)}
				withOutsideShadow
			>
				<SimpleStub variant="no-access" text={t(Questions.PREVIEW_LOCKED_COLLECTION)} />
			</Card>
		);

	return (
		<Card
			className={styles.wrapper}
			title={t(Questions.PREVIEW_TITLE)}
			headerAction={<CollectionWarningInfo />}
			withOutsideShadow
		>
			{displayedQuestions.length ? (
				<Flex componentType="ul" direction="column" gap="12">
					{displayedQuestions?.map((question) => (
						<PreviewQuestionsItem
							key={question.id}
							title={question.title}
							questionId={question.id}
							rate={question.rate}
							complexity={question.complexity}
							imageSrc={question.questionSkills[0].imageSrc ?? undefined}
							specialization={specialization}
						/>
					))}
					{showRegistrationBanner && <RegistrationBanner questionsCount={hiddenQuestionsCount} />}
				</Flex>
			) : (
				<SimpleStub variant="empty" text={t(Questions.PREVIEW_EMPTY_COLLECTION)} />
			)}
		</Card>
	);
};
