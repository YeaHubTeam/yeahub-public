import { Collection } from '@/entities/collection';
import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { Header } from '@/widgets/Specialization/Header';
import { SpecializationCollections } from '@/widgets/Specialization/SpecializationCollections';

interface SpecializationPageProps {
	specialization: Specialization;
	collections: Collection[];
	locale: string;
}

export const SpecializationPage = ({
	specialization,
	collections,
	locale,
}: SpecializationPageProps) => {
	return (
		<Flex direction="column" gap="40">
			<Header specialization={specialization} />
			<SpecializationCollections
				collections={collections}
				specializationSlug={specialization.slug}
				locale={locale}
			/>
		</Flex>
	);
};
