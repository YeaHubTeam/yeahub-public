import classNames from 'classnames';

import { EvidenceItem } from '@/entities/vacancy';
import { Pallete } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Icon, IconName } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './ComparisonList.module.css';

type ComparisonListVariant = 'success' | 'error';

interface ComparisonListProps {
	title: string;
	items: EvidenceItem[];
	variant: ComparisonListVariant;
}

export const ComparisonList = ({ title, items, variant }: ComparisonListProps) => {
	const iconName: Record<ComparisonListVariant, IconName> = {
		success: 'successCircle',
		error: 'errorCircle',
	};

	const iconColor: Record<ComparisonListVariant, Pallete> = {
		success: 'green-700',
		error: 'red-800',
	};

	return (
		<Flex componentType="section" direction="column" gap="20" maxWidth>
			<Flex align="center" gap="8">
				<Text variant="body3-accent" color="black-900">
					{title}
				</Text>
			</Flex>

			<Flex componentType="ul" direction="column" gap="20" maxWidth>
				{items.map((item, index) => (
					<Flex key={`${item.title}-${index}`} componentType="li" align="start" gap="8">
						<Icon
							icon={iconName[variant]}
							size={16}
							color={iconColor[variant]}
							className={classNames(styles.icon, styles[`icon-${variant}`])}
							aria-hidden
						/>

						<Flex direction="column" gap="4">
							<Text variant="body3-accent" color="black-900">
								{item.title}
							</Text>

							{item.evidence && (
								<Text variant="body3" color="black-500">
									{item.evidence}
								</Text>
							)}
						</Flex>
					</Flex>
				))}
			</Flex>
		</Flex>
	);
};
