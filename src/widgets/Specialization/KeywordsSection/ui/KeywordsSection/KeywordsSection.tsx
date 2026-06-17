import { useTranslations } from 'next-intl';

import { HhTopBySpecResponse } from '@/entities/hh';
import { Specializations, i18Namespace } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';
import { CollapsibleChipGrid } from '@/widgets/Specialization/CollapsibleChipGrid';

interface KeywordsSectionProps {
	keywords?: HhTopBySpecResponse['keywords'];
}

export const KeywordsSection = ({ keywords = [] }: KeywordsSectionProps) => {
	const t = useTranslations(i18Namespace.specialization);

	if (!keywords.length) {
		return null;
	}

	return (
		<SectionWrapper title={t(Specializations.KEYWORDS_SUBTITLE)}>
			<CollapsibleChipGrid>
				{keywords.map((keyword) => (
					<Chip key={keyword.title} label={keyword.title} variant="big" />
				))}
			</CollapsibleChipGrid>
		</SectionWrapper>
	);
};
