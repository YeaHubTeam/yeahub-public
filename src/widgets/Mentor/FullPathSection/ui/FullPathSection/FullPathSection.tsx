import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import FullPathStepperBlock from '@/widgets/Mentor/FullPathSection/ui/FullPathStepperBlock/FullPathStepperBlock';

import { SectionHeader } from '../../../SectionHeader';
import { AdvantagesList } from '../AdvantagesList/AdvantagesList';

export const FullPathSection = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader label={t(Mentor.FULLPATH_INDICATOR)} title={t(Mentor.FULLPATH_TITLE)} />
			<Flex direction="column" gap="20">
				<FullPathStepperBlock />
				<AdvantagesList />
			</Flex>
		</section>
	);
};
