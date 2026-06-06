import { Collection, CollectionPreview } from '@/entities/collection';
import { Specializations } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/widgets/Specialization/SectionWrapper';

interface CollectionsSectionProps {
	collections: Collection[];
	specializationSlug: string;
	locale: string;
}

export const CollectionsSection = ({
	collections,
	specializationSlug,
	locale,
}: CollectionsSectionProps) => {
	if (collections.length === 0) return null;

	const allCollectionsPath = `/${locale}/collections/${specializationSlug}`;

	return (
		<SectionWrapper
			title={Specializations.COLLECTIONS_TITLE}
			actionTitle={Specializations.COLLECTIONS_LINK}
			actionRoute={allCollectionsPath}
		>
			<Flex direction="column" gap="20">
				{collections.map((collection) => (
					<CollectionPreview
						key={collection.id}
						collection={collection}
						specialization={specializationSlug}
						locale={locale}
					/>
				))}
			</Flex>
		</SectionWrapper>
	);
};
