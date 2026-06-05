import { ResourceCard, getResourcesList } from '@/entities/resource';
import { type Specialization } from '@/entities/specialization';
import { ROUTES, Specializations } from '@/shared/config';
import { route } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/widgets/Specialization/SectionWrapper';

interface ResourcesSectionProps {
	locale: string;
	specialization: Specialization;
}

export const ResourcesSection = async ({ locale, specialization }: ResourcesSectionProps) => {
	const detailRoute = `/${locale}${route(ROUTES.resources.page, specialization.slug)}`;

	const resourcesParams = {
		specializations: specialization.id,
		limit: 3,
		random: true,
	};

	const resources = await getResourcesList(resourcesParams);

	if (!resources || !resources?.data?.length) {
		return null;
	}

	return (
		<SectionWrapper
			actionTitle={Specializations.PREPARATION_MATERIALS_LINK}
			actionRoute={detailRoute}
			title={Specializations.PREPARATION_MATERIALS_TITLE}
		>
			<Flex direction="column" gap="20">
				{resources.data.map((resource) => (
					<ResourceCard key={resource.id} resource={resource} />
				))}
			</Flex>
		</SectionWrapper>
	);
};
