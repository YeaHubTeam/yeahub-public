import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../../SectionHeader';
import { FaqList } from '../FaqList/FaqList';

export const FaqSection = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.FAQ_INDICATOR)}
				title={t(Mentor.FAQ_TITLE)}
				description={t(Mentor.FAQ_DESCRIPTION)}
			/>
			<FaqList />
		</section>
	);
};
