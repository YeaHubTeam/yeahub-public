import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TechItem } from '../../model/costants/mentorStackConstants';
import styles from './StackList.module.css';

interface MentorStackColumnProps {
	title: string;
	rows: TechItem[][];
}

export const StackList = ({ title, rows }: MentorStackColumnProps) => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Flex direction="column" gap="16" className={styles['column-wrapper']}>
			<Text variant="head3" className={styles['column-title']}>
				{title}
			</Text>
			<Flex direction="column" gap="20">
				{rows.map((row, rowIndex) => (
					<Flex key={rowIndex} gap="20" className={styles['column-columns']}>
						{row.map(({ id, alt, src }) => (
							<div key={id} className={styles['column-icon']}>
								<Image src={src} alt={t(alt)} width={36} height={36} loading="lazy" />
							</div>
						))}
					</Flex>
				))}
			</Flex>
		</Flex>
	);
};
