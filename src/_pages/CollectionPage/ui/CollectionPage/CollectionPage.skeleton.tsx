'use client';

import { ButtonSkeleton } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import {
	AdditionalInfoSkeleton,
	CollectionBodySkeleton,
	CollectionHeaderSkeleton,
} from '@/widgets/Collection';

import styles from './CollectionPage.module.css';

export const CollectionPageSkeleton = () => {
	return (
		<Flex direction="column" align="start">
			<Flex gap="20" maxWidth>
				<Flex gap="20" direction="column" flex={1} maxWidth>
					<CollectionHeaderSkeleton />
					<Card>
						<Flex align="center" direction="column" gap="12">
							<ButtonSkeleton className={styles.button} variant="tertiary" />
							{/*<CollectionNavigationButtons isDisabled={true} />*/}
						</Flex>
					</Card>
					<CollectionBodySkeleton />
				</Flex>
				<Flex direction="column" gap="20" className={styles.additional}>
					<AdditionalInfoSkeleton />
				</Flex>
			</Flex>
		</Flex>
	);
};
