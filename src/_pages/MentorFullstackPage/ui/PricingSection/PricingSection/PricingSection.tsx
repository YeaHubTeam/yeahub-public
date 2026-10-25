import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { SectionHeader } from '../../SectionHeader';
import { TariffList } from '../TariffList/TariffList';
import { InfoBlock } from '../infoBlock/InfoBlock';
import styles from './PricingSection.module.css';

export const PricingSection = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section>
			<SectionHeader
				label={t(MentorFullstack.PRICING_INDICATOR)}
				title={t(MentorFullstack.PRICING_TITLE)}
				description={t(MentorFullstack.PRICING_DESCRIPTION)}
			/>
			<Flex wrap="wrap" className={styles.content}>
				<TariffList />
				<InfoBlock />
			</Flex>
		</section>
	);
};
