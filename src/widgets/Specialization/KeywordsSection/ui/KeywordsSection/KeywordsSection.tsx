import { HhTopBySpecResponse } from '@/entities/hh';
import { Specializations } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/widgets/Specialization/SectionWrapper';

interface KeywordsSectionProps {
	keywords?: HhTopBySpecResponse['keywords'];
}

export const KeywordsSection = ({ keywords = [] }: KeywordsSectionProps) => {
	if (!keywords.length) {
		return null;
	}

	return (
		<SectionWrapper title={Specializations.KEYWORDS_SUBTITLE}>
			<Flex gap="16" wrap="wrap">
				{keywords.map((skill) => (
					<Chip key={skill.title} label={skill.title} variant="big" />
				))}
			</Flex>
		</SectionWrapper>
	);
};
