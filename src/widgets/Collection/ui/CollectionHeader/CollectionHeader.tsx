import { useTranslations } from 'next-intl';

import { Collection } from '@/entities/collection';
import { Collections, i18Namespace } from '@/shared/config';
import { AdditionalInfoDrawer } from '@/shared/ui/AdditionalInfoDrawer';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';
import { AdditionalInfo } from '@/widgets/Collection';

import styles from './CollectionHeader.module.css';

interface CollectionHeaderProps {
	collection: Collection;
}

export const CollectionHeader = ({ collection }: CollectionHeaderProps) => {
	const t = useTranslations(i18Namespace.collection);
	const {
		imageSrc,
		company,
		title,
		specializations,
		keywords,
		isFree,
		questionsCount,
		description,
	} = collection;
	const collectionImageSrc = imageSrc || company?.imageSrc;

	return (
		<Card className={styles.wrapper} withOutsideShadow>
			<Flex gap="20" direction={'row'}>
				<ImageWithWrapper
					src={collectionImageSrc}
					className={styles['image-default']}
					alt={t(Collections.IMAGE_ALT, { title, keywords: keywords?.join(', ') || '' })}
				/>
				<Flex flex={1} direction="column">
					<Flex direction="row" gap="8" justify="between" align="start">
						<Text variant="body6" isMainTitle>
							{title}
						</Text>
						<AdditionalInfoDrawer>
							<AdditionalInfo
								specializations={specializations}
								isFree={isFree}
								company={company}
								questionsCount={questionsCount}
								keywords={keywords}
							/>
						</AdditionalInfoDrawer>
					</Flex>

					<Text variant="body3-accent">{description}</Text>
				</Flex>
			</Flex>
		</Card>
	);
};
