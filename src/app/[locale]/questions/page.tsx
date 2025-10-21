import { redirect } from 'next/navigation';

import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/constants';

const QuestionsRoot = () => {
	redirect(`/questions/${DEFAULT_SPECIALIZATION_SLUG}`);
};

export default QuestionsRoot;
