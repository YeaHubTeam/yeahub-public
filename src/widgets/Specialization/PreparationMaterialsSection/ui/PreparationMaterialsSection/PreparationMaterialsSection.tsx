import { getResourcesList } from '@/entities/resource';
import { type Specialization } from '@/entities/specialization';
import { ROUTES, Specializations } from '@/shared/config';
import { route } from '@/shared/libs';
import { SectionWrapper } from '@/widgets/Specialization/SectionWrapper';

import { PreparationMaterialsList } from '../PreparationMaterialsList/PreparationMaterialsList';

interface PreparationMaterialsSectionProps {
	locale: string;
	specialization: Specialization;
}

export const PreparationMaterialsSection = async ({
	locale,
	specialization,
}: PreparationMaterialsSectionProps) => {
	const detailRoute = `/${locale}${route(ROUTES.resources.page, specialization.slug)}`;

	const resourcesParams = {
		specializations: specialization.id,
		limit: 3,
		random: true,
	};

	const resources = await getResourcesList(resourcesParams);

	return (
		<SectionWrapper
			actionTitle={Specializations.PREPARATION_MATERIALS_LINK}
			actionRoute={detailRoute}
			title={Specializations.PREPARATION_MATERIALS_TITLE}
		>
			<PreparationMaterialsList resources={resources.data} />
		</SectionWrapper>
	);
};
