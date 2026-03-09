'use client';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import {
	type CreateQuizFilterParams,
	LS_ACTIVE_MOCK_QUIZ_KEY,
	useCreateMockQuiz,
} from '@/entities/quiz';
import { InterviewQuizCreate, ROUTES, i18Namespace } from '@/shared/config';
import { setToLS } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

import styles from './CreateQuizLink.module.css';

interface CreateQuizLinkProps {
	filter: CreateQuizFilterParams;
}

export const CreateQuizLink = ({ filter }: CreateQuizLinkProps) => {
	const t = useTranslations(i18Namespace.interviewQuizCreate);
	const router = useRouter();

	const { fetch } = useCreateMockQuiz({
		onSuccess: (data) => {
			if (data) {
				setToLS(LS_ACTIVE_MOCK_QUIZ_KEY, data);
				router.push(`${ROUTES.quiz.page}?specializationId=${filter.specialization}`);
			}
		},
	});

	const onCreateMockQuiz = () => {
		void fetch({
			skills: filter.skills ? filter.skills.join(',') : undefined,
			limit: filter.limit,
			specialization: filter.specialization,
		});
	};

	return (
		<Button
			className={styles.button}
			onClick={onCreateMockQuiz}
			suffix={<Icon icon="arrowRight" size={24} />}
			disabled={false}
		>
			{t(InterviewQuizCreate.CREATE_BUTTON)}
		</Button>
	);
};
