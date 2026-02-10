'use client';

import { useTranslations } from 'next-intl';

import { ChooseCollectionAccess } from '@/entities/collection';
import { MediaLinksBanner, getChannelsForSpecialization } from '@/entities/socialMedia';
import {
	DEFAULT_SPECIALIZATION_ID,
	SpecializationSlug,
	SpecializationsListField,
} from '@/entities/specialization';
import { Collections, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';

import { useCollectionsFilters } from '../../model/api/useCollectionsFilters';

interface CollectionsFilterPanelProps {
	specializationSlugs: SpecializationSlug[];
}

export const CollectionsFilterPanel = ({ specializationSlugs }: CollectionsFilterPanelProps) => {
	const { filter, selectedSpecialization, handlers } = useCollectionsFilters(specializationSlugs);
	const t = useTranslations(i18Namespace.collection);

	const media = getChannelsForSpecialization(selectedSpecialization ?? DEFAULT_SPECIALIZATION_ID);

	return (
		<Flex direction="column" gap="24">
			<SearchInput
				placeholder={t(Collections.SEARCH_PLACEHOLDER)}
				onSearch={handlers.onSearch}
				currentValue={filter.titleOrDescriptionSearch}
			/>
			<SpecializationsListField
				selectedSpecialization={selectedSpecialization}
				onChangeSpecialization={handlers.onChangeSpecialization}
			/>
			<ChooseCollectionAccess isFree={filter.isFree} onChangeIsFree={handlers.onChangeIsFree} />

			{media && <MediaLinksBanner mediaLink={media} />}
		</Flex>
	);
};
