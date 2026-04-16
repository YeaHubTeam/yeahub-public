import { useTranslations } from 'next-intl';

import { Collection, CollectionPreview } from '@/entities/collection';
import { Collections, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

interface CollectionsListProps {
	collections: Collection[];
	hasFilters: boolean;
	specialization: string;
	locale: string;
}

export const CollectionsList = ({
	collections,
	specialization,
	hasFilters,
	locale,
}: CollectionsListProps) => {
	const t = useTranslations(i18Namespace.collection);

	if (collections.length === 0 && !hasFilters) {
		return (
			<Stub
				type="empty"
				title={t(Collections.STUB_EMPTY_TITLE)}
				subtitle={t(Collections.STUB_EMPTY_SUBTITLE)}
			/>
		);
	}

	if (collections.length === 0 && hasFilters) {
		return <Stub type="filter-empty" />;
	}

	return (
		<Flex direction="column" gap="20">
			{collections.map((collection) => (
				<CollectionPreview
					key={collection.id}
					collection={collection}
					specialization={specialization}
					locale={locale}
				/>
			))}
		</Flex>
	);
};
