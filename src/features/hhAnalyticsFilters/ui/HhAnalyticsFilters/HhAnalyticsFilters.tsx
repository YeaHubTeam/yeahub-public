'use client';

import { SpecializationSelect } from '@/entities/specialization';
import { useScreenSize } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';

import type { HhAnalyticsMode } from '../../model/types/types';
import { HhAnalyticsModeTabs } from '../HhAnalyticsModeTabs/HhAnalyticsModeTabs';

type HhAnalyticsFiltersProps = {
	specializationId: number;
	mode: HhAnalyticsMode;
	onChangeSpecialization: (specializationId: number) => void;
	onChangeMode: (mode: HhAnalyticsMode) => void;
};

export const HhAnalyticsFilters = ({
	onChangeSpecialization,
	specializationId,
	mode,
	onChangeMode,
}: HhAnalyticsFiltersProps) => {
	const { isMobile } = useScreenSize();

	const handleChangeSpecialization = (value: number | number[]) => {
		const specializationId = Array.isArray(value) ? value[0] : value;
		onChangeSpecialization(specializationId);
	};

	return (
		<Flex justify="between" direction={isMobile ? 'column' : 'row'} gap="24">
			<SpecializationSelect
				prefix={' '}
				value={specializationId}
				onChange={handleChangeSpecialization}
				hasMultiple={false}
			/>

			<HhAnalyticsModeTabs mode={mode} onChange={onChangeMode} />
		</Flex>
	);
};
