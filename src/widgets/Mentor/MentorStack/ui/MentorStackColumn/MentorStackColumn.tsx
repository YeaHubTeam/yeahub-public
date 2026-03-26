import Image from 'next/image';

import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TechItem } from '../../model/costants/mentorStackConstants';
import styles from './MentorStackColumn.module.css';

interface MentorStackColumnProps {
	title: string;
	rows: TechItem[][];
}

export const MentorStackColumn = ({ title, rows }: MentorStackColumnProps) => {
	return (
		<Flex direction="column" gap="16" className={styles['column-wrapper']}>
			<Text variant="body6" color="black-900" className={styles['column-title']}>
				{title}
			</Text>
			<Flex direction="column" gap="20">
				{rows.map((row, rowIndex) => (
					<Flex key={rowIndex} gap="20" className={styles['column-columns']}>
						{row.map(({ id, alt, src }) => (
							<div key={id} className={styles['column-icon']}>
								<Image src={src} alt={alt} width={36} height={36} loading="lazy" />
							</div>
						))}
					</Flex>
				))}
			</Flex>
		</Flex>
	);
};
