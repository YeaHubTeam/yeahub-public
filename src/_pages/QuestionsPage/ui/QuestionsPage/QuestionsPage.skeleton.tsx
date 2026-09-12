import { ListPageWrapperSkeleton } from '@/widgets/ListPageWrapper';
import { FullQuestionsListSkeleton } from '@/widgets/question/QuestionsList';

import { QuestionsFilterPanelSkeleton } from '../QuestionsFilterPanel/QuestionsFilterPanel.skeleton';

export const QuestionsPageSkeleton = () => (
	<ListPageWrapperSkeleton
		itemsListSkeleton={<FullQuestionsListSkeleton />}
		filterPanelSkeleton={<QuestionsFilterPanelSkeleton />}
	/>
);
