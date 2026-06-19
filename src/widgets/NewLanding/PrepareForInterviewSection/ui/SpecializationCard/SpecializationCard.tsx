import Link from 'next/link';

import { ROUTES } from '@/shared/config';
import { route } from '@/shared/libs';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { Specialization } from '../../model/types';
import styles from './SpecializationCard.module.css';

interface SpecializationCardProps {
	specialization: Specialization;
}

export const SpecializationCard = ({ specialization }: SpecializationCardProps) => {
	const detailRoute = route(ROUTES.specializations.detail.page, specialization.slug);

	return (
		<Link href={detailRoute}>
			<Card withOutsideShadow className={styles.card} contentClassName={styles['card-content']}>
				<div className={styles['card-ellipse']}></div>
				<Flex direction="column" justify="between" maxHeight>
					<Badge icon="lightning" variant="purple" wrapperClassName={styles['icon-wrapper']} />
					<Flex direction="column" gap="16">
						<Text variant="head3">{specialization.title}</Text>
						<Flex gap="12">
							{specialization.skills.map((skill) => (
								<Flex align="center" key={skill} className={styles.chip}>
									<Text variant="body3-accent">{skill}</Text>
								</Flex>
							))}
						</Flex>
					</Flex>
				</Flex>
			</Card>
		</Link>
	);
};
