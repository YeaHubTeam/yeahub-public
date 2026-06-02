import { useTranslations } from 'next-intl';

import { Resource, ResourceCard } from '@/entities/resource';
import { Resources, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

interface PreparationMaterialsListProps {
	resources: Resource[];
}

export const PreparationMaterialsList = ({ resources }: PreparationMaterialsListProps) => {
	const t = useTranslations(i18Namespace.resources);

	if (resources.length === 0) {
		return (
			<Stub
				type="empty"
				title={t(Resources.STUB_EMPTY_RESOURCES_TITLE)}
				subtitle={t(Resources.STUB_EMPTY_RESOURCES_SUBTITLE)}
			/>
		);
	}

	return (
		<Flex direction="column" gap="20">
			{resources.map((resource) => (
				<ResourceCard key={resource.id} resource={resource} />
			))}
		</Flex>
	);
};
