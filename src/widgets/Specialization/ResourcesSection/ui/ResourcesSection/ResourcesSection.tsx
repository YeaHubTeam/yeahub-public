import { getTranslations } from 'next-intl/server';

import { ResourceCard, getResourcesList } from '@/entities/resource';
import { type Specialization } from '@/entities/specialization';
import { ROUTES, Specializations, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

interface ResourcesSectionProps {
	locale: string;
	specialization: Specialization;
}

export const ResourcesSection = async ({ locale, specialization }: ResourcesSectionProps) => {
	const t = await getTranslations(i18Namespace.specialization);

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
			actionTitle={t(Specializations.PREPARATION_MATERIALS_LINK)}
			actionRoute={detailRoute}
			title={t(Specializations.PREPARATION_MATERIALS_TITLE)}
		>
			<Flex direction="column" gap="20">
				{resources.data.map((resource) => (
					<ResourceCard key={resource.id} resource={resource} />
				))}
			</Flex>
		</SectionWrapper>
	);
};
