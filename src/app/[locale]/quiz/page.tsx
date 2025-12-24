import { redirect } from 'next/navigation';

import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/libs';

const CreateQuizRoot = () => {
	redirect(`/quiz/${DEFAULT_SPECIALIZATION_SLUG}`);
};

export default CreateQuizRoot;
