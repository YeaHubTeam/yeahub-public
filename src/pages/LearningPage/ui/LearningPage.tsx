import { Flex } from '@/shared/ui/Flex';
import { AdvantagesBlock, GurusBlock, MentorsBlock } from '@/widgets/Learning';

export const LearningPage = () => {
	return (
		<Flex gap="100" direction="column">
			<AdvantagesBlock />
			<MentorsBlock />
			<GurusBlock />
		</Flex>
	);
};
