import { redirect } from 'next/navigation';

import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/libs';

const QuestionsRoot = () => {
	redirect(`/resources/${DEFAULT_SPECIALIZATION_SLUG}`);
};

export default QuestionsRoot;
