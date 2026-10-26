import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { SectionHeaderLabel } from '../SectionHeaderLabel/SectionHeaderLabel';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
	label: string;
	title: string;
	description?: string;
	descriptionStyles?: string;
	titleStyles?: string;
}

export const SectionHeader = ({
	label,
	title,
	description,
	descriptionStyles,
	titleStyles,
}: SectionHeaderProps) => {
	return (
		<div className={styles.wrapper}>
			<SectionHeaderLabel text={label} />
			<Flex className={styles.block} direction="column" gap="10">
				<Text
					className={[styles.title, titleStyles ? titleStyles : ''].join(' ')}
					variant="head2"
					color="black-900"
				>
					{title}
				</Text>
				{description ? (
					<Text
						variant="body3-accent"
						color="black-900"
						className={[styles.description, descriptionStyles ? descriptionStyles : ''].join(' ')}
					>
						{description}
					</Text>
				) : null}
			</Flex>
		</div>
	);
};
