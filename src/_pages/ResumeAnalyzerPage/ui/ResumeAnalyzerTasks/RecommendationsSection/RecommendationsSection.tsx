import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './RecommendationsSection.module.css';

interface RecommendationsSectionProps {
	title: string;
	recommendations: string[];
}

export const RecommendationsSection = ({ title, recommendations }: RecommendationsSectionProps) => {
	if (recommendations.length === 0) {
		return null;
	}

	return (
		<Flex
			componentType="section"
			direction="column"
			gap="12"
			maxWidth
			className={styles.recommendations}
		>
			<Flex align="center" gap="8">
				<Icon icon="lightBulb" size={20} color="purple-700" className={styles.icon} aria-hidden />

				<Text variant="body3-strong" color="black-900" className={styles.title}>
					{title}
				</Text>
			</Flex>

			<Flex componentType="ul" direction="column" gap="12" maxWidth>
				{recommendations.map((recommendation, index) => (
					<Flex
						key={`${recommendation}-${index}`}
						componentType="li"
						align="start"
						gap="12"
						className={styles.list}
					>
						<Text variant="body3-accent" color="black-500">
							{recommendation}
						</Text>
					</Flex>
				))}
			</Flex>
		</Flex>
	);
};
