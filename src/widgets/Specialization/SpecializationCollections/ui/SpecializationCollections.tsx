import { useTranslations } from 'next-intl';

import { Collection, CollectionPreview } from '@/entities/collection';
import { Specializations, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

interface SpecializationCollectionsProps {
	collections: Collection[];
	specializationSlug: string;
	locale: string;
}

export const SpecializationCollections = ({
	collections,
	specializationSlug,
	locale,
}: SpecializationCollectionsProps) => {
	const t = useTranslations(i18Namespace.specialization);

	if (collections.length === 0) return null;

	const allCollectionsPath = `/${locale}/collections/${specializationSlug}`;

	return (
		<Flex direction="column" gap="20" componentType="section">
			<Flex justify="between" align="center">
				<Text variant="body6">{t(Specializations.COLLECTIONS_TITLE)}</Text>
				<Button
					variant="link"
					href={allCollectionsPath}
					suffix={<Icon icon="arrowRight" size={20} color="purple-700" />}
				>
					{t(Specializations.COLLECTIONS_LINK)}
				</Button>
			</Flex>

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
		</Flex>
	);
};
