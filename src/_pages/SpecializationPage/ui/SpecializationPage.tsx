import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { Header } from '@/widgets/Specialization/Header';
import { PreparationMaterialsSection } from '@/widgets/Specialization/PreparationMaterialsSection';

interface SpecializationPageProps {
	specialization: Specialization;
	locale: string;
}

export const SpecializationPage = ({ specialization, locale }: SpecializationPageProps) => {
	return (
		<Flex direction="column" gap="40">
			<Header specialization={specialization} />
			<PreparationMaterialsSection locale={locale} specialization={specialization} />
		</Flex>
	);
};
