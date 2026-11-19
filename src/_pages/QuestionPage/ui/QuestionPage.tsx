import {
	getGuruWithMatchingSpecialization,
	getNewGuruWithMatchingSpecialization,
} from '@/entities/guru';
import type { PersonalNavigationPageReader, FavoriteQuestionInput, FavoriteQuestionResult, QuestionStudyInput, QuestionStudyResult } from '@/entities/question';
import { Question, QuestionAdditionalInfo } from '@/entities/question';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';
import { SidebarBanner } from '@/widgets/Media';
import { QuestionBody } from '@/widgets/question/QuestionBody';
import { QuestionHeader } from '@/widgets/question/QuestionHeader';
import {
	QuestionFavoriteActions,
	QuestionPersonalStateProvider,
	QuestionProgress,
} from '@/widgets/question/QuestionPersonalState';

import styles from './QuestionPage.module.css';

interface QuestionPageProps {
	question: Question;
	specialization?: string;
	favoriteAction: (input: FavoriteQuestionInput) => Promise<FavoriteQuestionResult>;
	progressAction?: (input: QuestionStudyInput) => Promise<QuestionStudyResult>;
	navigationAction?: PersonalNavigationPageReader;
}

export const QuestionPage = ({ question, specialization, favoriteAction, progressAction, navigationAction }: QuestionPageProps) => {
	if (!question) {
		return null;
	}

	const {
		rate,
		keywords,
		complexity,
		questionSkills,
		shortAnswer,
		longAnswer,
		questionSpecializations,
	} = question;

	const guru = getGuruWithMatchingSpecialization(questionSpecializations || []);
	const newGuru = getNewGuruWithMatchingSpecialization(questionSpecializations);

	return (
		<QuestionPersonalStateProvider questionId={question.id}>
			<Flex direction="column" align="start">
				<Flex>
					<BackButton />
				</Flex>
				<Flex gap="20" maxWidth>
					<Flex gap="20" direction="column" flex={1} className={styles.main}>
						<QuestionHeader question={question} personalProgress={<QuestionProgress inDrawer />} />
						<QuestionFavoriteActions navigation={{ readPersonalPage: navigationAction, questionId: question.id, specialization: questionSpecializations?.find(item => item.slug === specialization) }} action={favoriteAction} progressAction={progressAction} />
						<QuestionBody shortAnswer={shortAnswer} longAnswer={longAnswer} />
						<div className={styles.banner}>
							<SidebarBanner guru={guru} newGuru={newGuru} />
						</div>
					</Flex>
					<Flex direction="column" gap="20" className={styles.additional}>
						<QuestionProgress />
						<QuestionAdditionalInfo
							rate={rate}
							keywords={keywords}
							complexity={complexity}
							questionSkills={questionSkills}
							questionSpecializations={questionSpecializations}
						/>
						<SidebarBanner guru={guru} newGuru={newGuru} />
					</Flex>
				</Flex>
			</Flex>
		</QuestionPersonalStateProvider>
	);
};
