'use client';

import { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Resources, Translation, i18Namespace } from '@/shared/config';
import { BaseFilterItem, BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import { MAX_SHOW_LIMIT_TYPES } from '../../model/constants/resource';
import { useTypes } from '../../model/hooks/useTypes';
import type { ResourceTypeCode } from '../../model/types/resource';

interface ResourceTypesListFieldProps {
	selectedTypes?: ResourceTypeCode[];
	onChangeTypes: (resourceTypes: ResourceTypeCode[] | undefined) => void;
}

export const ResourceTypesListField = ({
	selectedTypes,
	onChangeTypes,
}: ResourceTypesListFieldProps) => {
	const t = useTranslations(i18Namespace.resources);
	const tCommon = useTranslations(i18Namespace.translation);

	const [showAll, setShowAll] = useState(false);
	const [limit, setLimit] = useState(MAX_SHOW_LIMIT_TYPES);

	const { data: resourceTypes } = useTypes();

	useEffect(() => {
		if (showAll) {
			const total = resourceTypes?.length || 0;
			setLimit(total);
		} else {
			setLimit(MAX_SHOW_LIMIT_TYPES);
		}
	}, [showAll, limit, resourceTypes]);

	const onToggleShowAll = () => {
		setShowAll(!showAll);
	};

	const onChooseResourceTypes = (type: ResourceTypeCode) => {
		const newValues = resourceTypes?.map((item) => item.code).filter((item) => item === type) || [];
		const isDataExist = selectedTypes?.some((item) => newValues.includes(item));
		const updates = isDataExist
			? (selectedTypes || []).filter((item) => !newValues.includes(item))
			: [...(selectedTypes || []), ...newValues];
		onChangeTypes(updates.length === 0 ? undefined : updates);
	};

	const resourceTypesItems: BaseFilterItem<ResourceTypeCode>[] | undefined = useMemo(
		() =>
			resourceTypes
				?.map(({ code, description }) => ({
					id: code,
					title: description,
					active: selectedTypes?.includes(code),
				}))
				.slice(0, limit),
		[selectedTypes, limit, resourceTypes],
	);

	return (
		<Flex direction="column" align="start" gap="8">
			<BaseFilterSection
				data={resourceTypesItems ?? []}
				title={t(Resources.RESOURCES_TITLE)}
				onClick={onChooseResourceTypes}
			/>
			<Button variant="link" onClick={onToggleShowAll}>
				{!showAll ? tCommon(Translation.SHOW_ALL) : tCommon(Translation.HIDE)}
			</Button>
		</Flex>
	);
};
