import { gurus } from '@/entities/guru';
import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { GuruSection, Header } from '@/widgets/Specialization/Header';

interface SpecializationPageProps {
	specialization: Specialization;
}

export const SpecializationPage = ({ specialization }: SpecializationPageProps) => {
	const hasGuru = gurus.find((g) => g.specializations.includes(specialization.id));
	return (
		<Flex direction="column" gap="40">
			<Header specialization={specialization} />

			{hasGuru && <GuruSection specializationId={specialization.id} />}
		</Flex>
	);
};
