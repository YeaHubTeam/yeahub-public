import { Flex } from '@/shared/ui/Flex';

import { specializations } from '../../../../model/constants';
import { CardBlockLayout } from '../../CardBlockLayout/CardBlockLayout';
import { SpecializationChip } from '../SpecializationChip/SpecializationChip';

export const SpecializationBlock = () => {
	return (
		<CardBlockLayout hasOffset>
			<Flex gap="16">
				<SpecializationChip
					src={specializations.dataScience.src}
					alt={specializations.dataScience.alt}
				/>
				<SpecializationChip src={specializations.ml.src} alt={specializations.ml.alt} />
				<SpecializationChip src={specializations.testing.src} alt={specializations.testing.alt} />
			</Flex>
			<Flex gap="16">
				<SpecializationChip src={specializations.testing.src} alt={specializations.testing.alt} />
				<SpecializationChip src={specializations.frontend.src} alt={specializations.frontend.alt} />
				<SpecializationChip
					src={specializations.gameDevelopment.src}
					alt={specializations.gameDevelopment.alt}
				/>
			</Flex>
			<Flex gap="16">
				<SpecializationChip
					src={specializations.androidDev.src}
					alt={specializations.androidDev.alt}
				/>
				<SpecializationChip
					src={specializations.androidDev.src}
					alt={specializations.androidDev.alt}
				/>
				<SpecializationChip src={specializations.iosDev.src} alt={specializations.iosDev.alt} />
			</Flex>
		</CardBlockLayout>
	);
};
