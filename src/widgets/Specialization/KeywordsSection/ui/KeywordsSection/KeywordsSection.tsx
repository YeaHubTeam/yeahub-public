import { HhTopBySpecResponse } from '@/entities/hh';
import { Specializations } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { CollapsibleChipGrid } from '@/widgets/Specialization/CollapsibleChipGrid';
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
			<CollapsibleChipGrid>
				{keywords.map((keyword) => (
					<Chip key={keyword.title} label={keyword.title} variant="big" />
				))}
			</CollapsibleChipGrid>
		</SectionWrapper>
	);
};
