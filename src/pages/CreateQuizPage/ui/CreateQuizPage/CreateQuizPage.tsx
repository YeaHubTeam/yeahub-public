import React from 'react';

import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { InterviewQuizCreate, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';

import { CreateQuizFilterPanel } from '../CreateQuizFilterPanel/CreateQuizFilterPanel';
import { CreateQuizLink } from '../CreateQuizLink/CreateQuizLink';
import styles from './CreateQuizPage.module.css';

interface CreateQuizPageProps {
	locale: string;
}

export const CreateQuizPage = ({ locale }: CreateQuizPageProps) => {
	setRequestLocale(locale);
	const t = useTranslations(i18Namespace.interviewQuizCreate);

	return (
		<section>
			<Card className={styles.container}>
				<h2 className={styles.title}>{t(InterviewQuizCreate.TITLE)}</h2>
				<CreateQuizFilterPanel />
				<CreateQuizLink />
			</Card>
		</section>
	);
};
