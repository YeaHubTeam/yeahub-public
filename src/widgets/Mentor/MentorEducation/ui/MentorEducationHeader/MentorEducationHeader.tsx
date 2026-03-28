import { Flex } from '@/shared/ui/Flex';
import { SectionLabel } from '@/shared/ui/SectionLabel';
import { Text } from '@/shared/ui/Text';

import styles from './MentorEducationHeader.module.css';

export const MentorEducationHeader = () => {
	return (
		<div className={styles.wrapper}>
			<SectionLabel text="образование" />
			<Flex direction="column" gap="10">
				<Text variant="head2-accent" color="black-1100">
					Ол-инклюзив в сфере образования.
				</Text>
				<Text variant="body3-accent" color="black-1100" width={487}>
					Ты приходишь, и всё решается за тебя: от первых шагов до поиска работы. Погружаешься в
					среду, где всё заточено на результат. Я веду тебя на каждом этапе.
				</Text>
			</Flex>
		</div>
	);
};
