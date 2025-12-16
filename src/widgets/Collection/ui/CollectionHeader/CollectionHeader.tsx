import { ReactNode } from 'react';

import classNames from 'classnames';

import { Collection } from '@/entities/collection';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import styles from './CollectionHeader.module.css';

interface CollectionHeaderProps
	extends Pick<Collection, 'title' | 'description' | 'imageSrc' | 'company'> {
	renderDrawer?: () => ReactNode;
}

export const CollectionHeader = ({
	title,
	description,
	imageSrc: collectionImageSrc,
	company,
}: CollectionHeaderProps) => {
	const imageSrc = collectionImageSrc && company?.imageSrc;

	return (
		<Card className={styles.wrapper} withOutsideShadow>
			<Flex gap="20" direction={'row'}>
				<ImageWithWrapper
					src={imageSrc}
					className={classNames(styles.image, styles['image-default'])}
				/>
				<Flex flex={1} direction="column">
					<Flex direction="row" gap="8" justify="between" align="start">
						<Text variant="head2" className={styles.title}>
							{title}
						</Text>
					</Flex>

					<Text variant="body3-accent">{description}</Text>
				</Flex>
			</Flex>
		</Card>
	);
};
