import { redirect } from 'next/navigation';

import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/constants/queryConstants';

const QuestionsRoot = () => {
	redirect(`/questions/${DEFAULT_SPECIALIZATION_SLUG}`);
};

export default QuestionsRoot;
