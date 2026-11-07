import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { GetSkillsListResponse } from '@/entities/skill';
import { TestCreate, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import { CreateTestFilterPanel } from '../CreateTestFilterPanel/CreateTestFilterPanel';
import styles from './CreateTestPage.module.css';

interface CreateTestPageProps {
	locale: string;
	initialSkills?: GetSkillsListResponse | null;
}

export const CreateTestPage = ({ locale, initialSkills }: CreateTestPageProps) => {
	setRequestLocale(locale);
	const t = useTranslations(i18Namespace.testCreate);

	return (
		<section>
			<Card className={styles.container}>
				<Text variant="body6" isMainTitle className={styles.title}>
					{t(TestCreate.TITLE)}
				</Text>
				<CreateTestFilterPanel initialSkills={initialSkills} />
			</Card>
		</section>
	);
};
