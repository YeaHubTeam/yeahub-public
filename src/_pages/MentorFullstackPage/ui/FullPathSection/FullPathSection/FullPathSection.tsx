import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { SectionHeader } from '../../SectionHeader';
import { AdvantagesList } from '../AdvantagesList/AdvantagesList';
import FullPathStepperBlock from '../FullPathStepperBlock/FullPathStepperBlock';

export const FullPathSection = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section>
			<SectionHeader
				label={t(MentorFullstack.FULLPATH_INDICATOR)}
				title={t(MentorFullstack.FULLPATH_TITLE)}
			/>
			<Flex direction="column" gap="20">
				<FullPathStepperBlock />
				<AdvantagesList />
			</Flex>
		</section>
	);
};
