import type { FavoriteQuestionInput, FavoriteQuestionResult } from './favorite';
import type { QuestionStudyInput, QuestionStudyResult } from './studyProgress';
import type { Question } from './question';

export type QuestionListStatus = 'all' | 'favorite' | 'learned' | 'not-learned';

// Only fields consumed by the existing list cards, never backend user/profile objects.
export type QuestionListItem = Pick<
	Question,
	'id' | 'title' | 'slug' | 'shortAnswer' | 'imageSrc' | 'complexity' | 'rate'
> & {
	// Optional for public rows; successful private reads normalize a missing record to 0/false.
	checksCount?: number;
	isLearned?: boolean;
	isFavorite?: boolean;
};

export type PersonalQuestionsInput = {
	status: QuestionListStatus;
	page: number;
	specializationId: number;
	title?: string;
	titleOrDescription?: string;
	skills?: string;
	complexity?: string;
	rate?: string;
	order?: 'ASC' | 'DESC';
	orderBy?: 'title' | 'complexity' | 'rate';
};

export type PersonalQuestionsData = {
	data: QuestionListItem[];
	page: number;
	limit: number;
	total: number;
};

export type QuestionListActions = {
	favorite: (input: FavoriteQuestionInput) => Promise<FavoriteQuestionResult>;
	study: (input: QuestionStudyInput) => Promise<QuestionStudyResult>;
};

export type PersonalNavigationPageResult =
	| {
		status: 'success';
		userId: string;
		profileId: string;
		list: { data: Pick<QuestionListItem, 'id' | 'slug'>[]; page: number; total: number; limit: number };
	}
	| { status: 'unavailable' };

export type PersonalNavigationPageReader = (input: PersonalQuestionsInput) => Promise<PersonalNavigationPageResult>;
