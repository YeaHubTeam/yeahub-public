import type { Collection } from '@/entities/collection';
import { GurusBanner, getGuruWithMatchingSpecialization } from '@/entities/guru';
import { SPEC_MAP } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { AdditionalInfo, CollectionBody, CollectionHeader } from '@/widgets/Collection';

import styles from './CollectionPage.module.css';

interface CollectionPageProps {
	collection: Collection;
	specialization: keyof typeof SPEC_MAP;
}

export const CollectionPage = ({ collection, specialization }: CollectionPageProps) => {
	const {
		createdBy,
		questionsCount,
		questions,
		isFree,
		company,
		specializations,
		keywords,
		title,
		description,
		imageSrc: collectionImageSrc,
	} = collection;

	const imageSrc = collectionImageSrc ?? company?.imageSrc;

	const guru = getGuruWithMatchingSpecialization(specializations || []);
	const showAuthor = guru ? false : true;

	return (
		<Flex direction="column" align="start">
			<Flex gap="20" maxWidth>
				<Flex gap="20" direction="column" flex={1} maxWidth>
					<CollectionHeader
						title={title}
						description={description}
						imageSrc={imageSrc}
						company={company}
					/>
					<CollectionBody
						isFree={isFree}
						questions={questions || []}
						specialization={specialization}
					/>
				</Flex>
				<Flex direction="column" gap="20" className={styles.additional}>
					<AdditionalInfo
						showAuthor={showAuthor}
						specializations={specializations}
						isFree={isFree}
						company={company}
						questionsCount={questionsCount}
						createdBy={createdBy}
						keywords={keywords}
					/>
					{guru && <GurusBanner gurus={[guru]} />}
				</Flex>
			</Flex>
		</Flex>
	);
};
