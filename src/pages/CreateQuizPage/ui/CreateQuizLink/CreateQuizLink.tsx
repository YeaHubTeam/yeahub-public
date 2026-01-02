'use client';

import { useTranslations } from 'next-intl';

import { InterviewQuizCreate, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

import styles from './CreateQuizLink.module.css';

export const CreateQuizLink = () => {
	const t = useTranslations(i18Namespace.interviewQuizCreate);
	return (
		<Button
			className={styles.button}
			onClick={() => {}}
			suffix={<Icon icon="arrowRight" size={24} />}
			disabled={false}
		>
			{t(InterviewQuizCreate.CREATE_BUTTON)}
		</Button>
	);
};
