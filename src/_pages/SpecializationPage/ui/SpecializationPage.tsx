import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { Header } from '@/widgets/Specialization/Header';

interface SpecializationPageProps {
	specialization: Specialization;
}

export const SpecializationPage = ({ specialization }: SpecializationPageProps) => {
	return (
		<Flex direction="column" gap="40">
			<Header specialization={specialization} />
		</Flex>
	);
};
