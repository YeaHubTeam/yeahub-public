import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { capitalizeFirstLetter } from '../capitalizeFirstLetter';
import styles from './MissingTasksSection.module.css';

interface MissingTasksSectionProps {
	title: string;
	tasks: string[];
}

export const MissingTasksSection = ({ title, tasks }: MissingTasksSectionProps) => {
	if (tasks.length === 0) {
		return null;
	}

	return (
		<Flex componentType="section" direction="column" gap="20" maxWidth>
			<Flex align="center" gap="8">
				<Text variant="body3-strong" color="black-900" className={styles.title}>
					{title}
				</Text>
			</Flex>

			<Flex componentType="ul" direction="column" gap="20" maxWidth>
				{tasks.map((task, index) => (
					<Flex key={`${task}-${index}`} componentType="li" align="start" gap="8">
						<Icon
							icon="errorCircle"
							size={16}
							color="red-800"
							className={styles.icon}
							aria-hidden
						/>

						<Text variant="body3-accent" color="black-900">
							{capitalizeFirstLetter(task)}
						</Text>
					</Flex>
				))}
			</Flex>
		</Flex>
	);
};
