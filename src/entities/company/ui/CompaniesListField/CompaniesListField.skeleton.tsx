import { BaseFilterSectionSkeleton } from '@/shared/ui/BaseFilterSection';
import { ButtonSkeleton } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

export const CompaniesListFieldSkeleton = () => {
	return (
		<Flex direction="column" align="start" gap="8">
			<BaseFilterSectionSkeleton length={5} width={300} />
			<ButtonSkeleton variant="link" width={100} />
		</Flex>
	);
};
