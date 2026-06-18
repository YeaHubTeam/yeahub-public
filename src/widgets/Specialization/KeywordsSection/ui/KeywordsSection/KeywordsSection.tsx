import { useTranslations } from 'next-intl';

import { HhTopBySpecResponse } from '@/entities/hh';
import { Specialization } from '@/entities/specialization';
import { ROUTES, Specializations, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';
import { StatusChip } from '@/shared/ui/StatusChip';

interface KeywordsSectionProps {
	keywords?: HhTopBySpecResponse['keywords'];
	specialization: Specialization;
}

export const KeywordsSection = ({ keywords = [], specialization }: KeywordsSectionProps) => {
	const t = useTranslations(i18Namespace.specialization);

	if (!keywords.length) {
		return null;
	}

	const hhAnalyticsRoute = `${ROUTES.hhAnalytics.page}?specialization=${specialization.id}&page=1`;

	const slicedKeywords = keywords.length > 20 ? keywords.slice(0, 20) : keywords;
	return (
		<SectionWrapper
			title={t(Specializations.KEYWORDS_SUBTITLE)}
			actionTitle={t(Specializations.SKILLS_LINK)}
			actionRoute={hhAnalyticsRoute}
		>
			<Flex direction="row" gap="12" wrap="wrap">
				{slicedKeywords.map((keyword) => (
					<StatusChip
						key={keyword.title}
						status={{ text: keyword.title, variant: 'green' }}
						size="medium"
					/>
				))}
			</Flex>
		</SectionWrapper>
	);
};
