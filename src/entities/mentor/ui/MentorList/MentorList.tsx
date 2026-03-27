import { Flex } from '@/shared/ui/Flex';

import { mentorCard } from '../../model/types/mentorCard';
import { MentorCard } from '../MentorCard/MentorCard';

interface MentorListProps {
	cards: mentorCard[];
}

export const MentorList = ({ cards }: MentorListProps) => {
	return (
		<Flex direction="row" gap="20">
			{cards.map((card) => (
				<MentorCard
					key={card.title}
					title={card.title}
					description={card.description}
					imageSrc={card.imageSrc}
				/>
			))}
		</Flex>
	);
};
