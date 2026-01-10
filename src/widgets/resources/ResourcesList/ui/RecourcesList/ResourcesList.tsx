import { useTranslations } from 'next-intl';

import { Resource, ResourceCard } from '@/entities/resource';
import { Resources, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

interface ResourcesListProps {
	resources: Resource[];
	hasFilters: boolean;
}

export const ResourcesList = ({ resources, hasFilters }: ResourcesListProps) => {
	const t = useTranslations(i18Namespace.resources);
	const showEmptyResourcesStub = resources.length === 0 && !hasFilters;
	const showFilterEmptyStub = resources.length === 0 && hasFilters;
	const showResourcesList = resources.length > 0;

	return (
		<Flex direction="column" gap="20">
			{showEmptyResourcesStub && (
				<Stub
					type="empty"
					title={t(Resources.STUB_EMPTY_RESOURCES_TITLE)}
					subtitle={t(Resources.STUB_EMPTY_RESOURCES_SUBTITLE)}
				/>
			)}
			{showFilterEmptyStub && <Stub type="filter-empty" />}
			{showResourcesList &&
				resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
		</Flex>
	);
};
