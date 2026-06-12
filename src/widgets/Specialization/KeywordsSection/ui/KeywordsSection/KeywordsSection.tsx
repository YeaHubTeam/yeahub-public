import { useTranslations } from 'next-intl';

import { HhTopBySpecResponse } from '@/entities/hh';
import { Specializations, i18Namespace } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

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
			<Flex gap="16" wrap="wrap">
				{keywords.map((skill) => (
					<Chip key={skill.title} label={skill.title} variant="big" />
				))}
			</Flex>
		</SectionWrapper>
	);
};
