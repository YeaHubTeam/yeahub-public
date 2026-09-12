import { getTranslations } from 'next-intl/server';

import { Vacancies, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import style from './ResumeAnalyzerHeader.module.css';

export const ResumeAnalyzerHeader = async () => {
	const t = await getTranslations(i18Namespace.vacancies);

	return (
		<Text variant="head2" isMainTitle className={style.title}>
			{t(Vacancies.RESUME_ANALYZER_TITLE)}
		</Text>
	);
};
