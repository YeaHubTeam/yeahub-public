import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';

import { SectionHeader } from '../../SectionHeader';
import { PricingExample } from '../PricingExample/PricingExample';
import { TariffList } from '../TariffList/TariffList';
import { ZeroExperienceBanner } from '../ZeroExperienceBanner/ZeroExperienceBanner';
import styles from './PricingSection.module.css';

export const PricingSection = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<section>
			<SectionHeader
				label={t(MentorWorldwide.PRICING_LABEL)}
				title={t(MentorWorldwide.PRICING_TITLE)}
				description={t(MentorWorldwide.PRICING_DESCRIPTION)}
			/>
			<Flex direction="column" className={styles.content}>
				<Chip
					disablePointer
					label={t(MentorWorldwide.PRICING_AUDIENCE)}
					className={styles.audience}
				/>
				<TariffList />
				<PricingExample />
				<ZeroExperienceBanner />
			</Flex>
		</section>
	);
};
