import { useTranslations } from 'next-intl';

import { type Keywords } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import { KeywordsInteractive } from './KeywordsInteractive/KeywordsInteractive';
import styles from './ResumeAnalyzerKeywords.module.css';

type ResumeAnalyzerKeywordsProps = {
	keywords: Keywords;
};

export const ResumeAnalyzerKeywords = ({ keywords }: ResumeAnalyzerKeywordsProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	return (
		<Card contentClassName={styles.wrapper}>
			<Flex gap="12" align="center" wrap="wrap">
				<Text variant="body6">{t(Vacancies.RESUME_ANALYZER_METRIC_KEYWORDS)}</Text>
				<StatusChip
					size="medium"
					status={{
						variant: 'purple',
						text: t(Vacancies.RESUME_ANALYZER_KEYWORDS_COVERAGE, {
							matched: keywords.totalMatched,
							total: keywords.totalVacancyKeywords,
						}),
					}}
				/>
			</Flex>
			<KeywordsInteractive keywords={keywords} />
		</Card>
	);
};
