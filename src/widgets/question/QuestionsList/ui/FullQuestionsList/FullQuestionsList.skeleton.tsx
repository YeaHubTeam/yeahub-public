import { AccordionSkeleton } from '@/shared/ui/Accordion';
import { Flex } from '@/shared/ui/Flex';

export const FullQuestionsListSkeleton = () => {
	return (
		<Flex direction="column" gap="20">
			{[...Array(10)].map((_, index) => (
				<AccordionSkeleton key={index} />
			))}
		</Flex>
	);
};
