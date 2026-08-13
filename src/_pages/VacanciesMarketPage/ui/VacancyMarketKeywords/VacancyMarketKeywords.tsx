import type { VacancyMarketTopItem } from '@/entities/vacancyMarket';
import { Text } from '@/shared/ui/Text';

import { KeywordChip } from '../KeywordChip';
import styles from './VacancyMarketKeywords.module.css';

interface VacancyMarketKeywordsProps {
	keywords: VacancyMarketTopItem[];
	title: string;
}

export const VacancyMarketKeywords = ({ keywords, title }: VacancyMarketKeywordsProps) => {
	return (
		<>
			<Text variant="body3-accent" color="black-500">
				{title}
			</Text>

			<div className={styles.keywords}>
				{keywords.map((keyword, index) => (
					<KeywordChip
						key={`${keyword.title}-${index}`}
						title={keyword.title}
						variant={index === 0 ? 'accent' : 'default'}
					/>
				))}
			</div>
		</>
	);
};
