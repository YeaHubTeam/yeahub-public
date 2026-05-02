import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { SectionHeader } from '../../../SectionHeader';
import { TariffList } from '../TariffList/TariffList';
import { InfoBlock } from '../infoBlock/InfoBlock';
import styles from './PricingSection.module.css';

export const PricingSection = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.PRICING_INDICATOR)}
				title={t(Mentor.PRICING_TITLE)}
				description={t(Mentor.PRICING_DESCRIPTION)}
			/>
			<Flex wrap="wrap" className={styles.content}>
				<TariffList />
				<InfoBlock />
			</Flex>
		</section>
	);
};
