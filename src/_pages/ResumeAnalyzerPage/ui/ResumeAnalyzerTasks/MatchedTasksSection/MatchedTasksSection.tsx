import type { ResumeAnalysis } from '@/entities/vacancy';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { capitalizeFirstLetter } from '../capitalizeFirstLetter';
import styles from './MatchedTasksSection.module.css';

interface MatchedTasksSectionProps {
	title: string;
	tasks: ResumeAnalysis['tasks']['matchedTasks'];
}

export const MatchedTasksSection = ({ title, tasks }: MatchedTasksSectionProps) => {
	return (
		<Flex componentType="section" direction="column" gap="20" maxWidth>
			<Flex align="center" gap="8">
				<Text variant="body3-accent" color="black-900">
					{title}
				</Text>
			</Flex>

			<Flex componentType="ul" direction="column" gap="20" maxWidth>
				{tasks.map((task, index) => (
					<Flex key={`${task.title}-${index}`} componentType="li" align="start" gap="8">
						<Icon
							icon="successCircle"
							size={16}
							color="green-700"
							className={styles.icon}
							aria-hidden
						/>

						<Flex direction="column" gap="4">
							<Text variant="body3-accent" color="black-900">
								{capitalizeFirstLetter(task.title)}
							</Text>

							{task.evidence && (
								<Text variant="body3" color="black-500">
									{capitalizeFirstLetter(task.evidence)}
								</Text>
							)}
						</Flex>
					</Flex>
				))}
			</Flex>
		</Flex>
	);
};
