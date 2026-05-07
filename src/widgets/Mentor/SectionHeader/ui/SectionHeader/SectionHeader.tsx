import classNames from 'classnames';

import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { SectionHeaderLabel } from '../SectionHeaderLabel/SectionHeaderLabel';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
	label: string;
	title: string;
	description?: string;
	className?: string;
}

export const SectionHeader = ({ label, title, description, className }: SectionHeaderProps) => {
	return (
		<div className={classNames(styles.wrapper, className)}>
			<SectionHeaderLabel text={label} />
			<Flex className={styles.block} direction="column" gap="10">
				<Text className={styles.title} variant="head2" color="black-900">
					{title}
				</Text>
				{description ? (
					<Text variant="body3-accent" color="black-900" className={styles.description}>
						{description}
					</Text>
				) : null}
			</Flex>
		</div>
	);
};
