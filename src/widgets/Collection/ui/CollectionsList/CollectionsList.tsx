import { useTranslations } from 'next-intl';

import { Collection, CollectionPreview } from '@/entities/collection';
import { Collections, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';
import { Text } from '@/shared/ui/Text';

import styles from './CollectionsList.module.css';

interface CollectionsListProps {
	collections: Collection[];
	hasFilters: boolean;
	specialization: string;
}

export const CollectionsList = ({
	collections,
	specialization,
	hasFilters,
}: CollectionsListProps) => {
	const t = useTranslations(i18Namespace.collection);

	const showEmptyCollectionsStub = collections.length === 0 && !hasFilters;
	const showFilterEmptyStub = collections.length === 0 && hasFilters;
	const showCollectionsList = collections.length > 0;

	return (
		<>
			<Flex className={styles.header} direction="row" justify="between">
				<Text variant="body6" isMainTitle>
					{t(Collections.COLLECTIONS_TITLE)}
				</Text>
			</Flex>
			<Flex direction="column" gap="20">
				{showEmptyCollectionsStub && (
					<Stub
						type="empty"
						title={t(Collections.STUB_EMPTY_TITLE)}
						subtitle={t(Collections.STUB_EMPTY_SUBTITLE)}
					/>
				)}

				{showFilterEmptyStub && <Stub type="filter-empty" />}

				{showCollectionsList &&
					collections.map((collection) => (
						<CollectionPreview
							key={collection.id}
							collection={collection}
							specialization={specialization}
						/>
					))}
			</Flex>
		</>
	);
};
