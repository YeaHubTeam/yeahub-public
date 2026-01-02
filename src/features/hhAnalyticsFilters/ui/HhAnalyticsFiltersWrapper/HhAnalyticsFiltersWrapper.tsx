'use client';

import { useHhFilters } from '../../hooks/useHhFilters';
import { HhAnalyticsFilters } from '../HhAnalyticsFilters/HhAnalyticsFilters';

interface HhAnalyticsFiltersWrapperProps {
	initialSpecializationId?: number;
	initialMode?: 'skills' | 'keywords';
	_initialPage?: number;
}

export const HhAnalyticsFiltersWrapper = ({
	initialSpecializationId,
	initialMode = 'skills',
	_initialPage,
}: HhAnalyticsFiltersWrapperProps) => {
	const { filters, setSpecialization, setMode } = useHhFilters({
		defaultSpecialization: initialSpecializationId,
		defaultMode: initialMode,
	});

	return (
		<HhAnalyticsFilters
			specializationId={filters.specialization}
			mode={filters.mode}
			onChangeSpecialization={setSpecialization}
			onChangeMode={setMode}
		/>
	);
};
