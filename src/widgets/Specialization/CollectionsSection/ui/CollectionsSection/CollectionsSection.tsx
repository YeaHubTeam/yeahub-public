import { useTranslations } from 'next-intl';

import { Collection, CollectionPreview } from '@/entities/collection';
import { Specializations, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

interface CollectionsSectionProps {
	collections: Collection[];
	specializationSlug?: string;
	locale: string;
	companyId?: string;
	title?: string;
}

export const CollectionsSection = ({
	collections,
	specializationSlug,
	locale,
	companyId,
	title,
}: CollectionsSectionProps) => {
	const t = useTranslations(i18Namespace.specialization);

	if (collections.length === 0) return null;

	const additionalParams = companyId ? `?companies=${companyId}` : '';
	const allCollectionsPath = specializationSlug
		? `/${locale}/collections/${specializationSlug}${additionalParams}`
		: undefined;

	return (
		<SectionWrapper
			title={title ?? t(Specializations.COLLECTIONS_TITLE)}
			actionTitle={t(Specializations.COLLECTIONS_LINK)}
			actionRoute={allCollectionsPath}
		>
			<Flex direction="column" gap="20">
				{collections.map((collection) => (
					<CollectionPreview
						key={collection.id}
						collection={collection}
						specialization={specializationSlug ?? ''}
						locale={locale}
					/>
				))}
			</Flex>
		</SectionWrapper>
	);
};
