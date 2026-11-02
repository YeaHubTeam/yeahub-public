import { Flex } from '@/shared/ui/Flex';
import { Indicator } from '@/shared/ui/Indicator';
import { Text } from '@/shared/ui/Text';

import styles from './BannerAdvantageList.module.css';

interface BannerAdvantageListProps {
	items: string[];
}

export const BannerAdvantageList = ({ items }: BannerAdvantageListProps) => {
	return (
		<Flex componentType="ul" direction="column" gap="12" className={styles.list}>
			{items.map((item) => (
				<Flex key={item} componentType="li" align="center" gap="20" className={styles.item}>
					<Indicator variant="red" />
					<Text variant="body3" color="black-800" className={styles.text}>
						{item}
					</Text>
				</Flex>
			))}
		</Flex>
	);
};
