import { getTranslations } from 'next-intl/server';

import { Auth, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import { BenefitItem } from '../BenefitItem/BenefitItem';
import styles from './BenefitsList.module.css';

export const BenefitsList = async () => {
	const t = await getTranslations(i18Namespace.auth);

	const benefitsItems: string[] = [
		Auth.BENEFITS_STEP_PLAN,
		Auth.BENEFITS_CAREER_GROWTH,
		Auth.BENEFITS_BIG_COMMUNITY,
		Auth.BENEFITS_MENTOR_TRAINING,
		Auth.BENEFITS_INTERNSHIP_OPPORTUNITIES,
	];

	return (
		<div className={styles['benefit-list-wrapper']}>
			<Text variant="head4" className={styles.title}>
				{t.rich(Auth.BENEFITS_TITLE, { br: () => <br /> })}
			</Text>
			<ul className={styles['benefit-wrapper']}>
				{benefitsItems.map((benefit) => (
					<BenefitItem key={benefit} text={t(benefit)} />
				))}
			</ul>
		</div>
	);
};
