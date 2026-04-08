import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Mentor } from '@/shared/config/i18n/i18nTranslations';
import { Card } from '@/shared/ui/Card';

import { SectionHeader } from '../../../SectionHeader';
import { ADVANCED_STACK, MAIN_STACK } from '../../model/costants/mentorStackConstants';
import { StackDescription } from '../StackDescription/StackDescription';
import { StackList } from '../StackList/StackList';
import styles from './StackSection.module.css';

export const StackSection = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.STACK_LABEL)}
				title={t(Mentor.STACK_TITLE)}
				description={t(Mentor.STACK_SUBTITLE)}
			/>
			<Card withOutsideShadow className={styles['stack-card']}>
				<div className={styles['stack-content']}>
					<StackDescription />
					<StackList title={t(Mentor.STACK_MAIN_TITLE)} rows={MAIN_STACK} />
					<StackList title={t(Mentor.STACK_ADVANCED_TITLE)} rows={ADVANCED_STACK} />
				</div>
			</Card>
		</section>
	);
};
