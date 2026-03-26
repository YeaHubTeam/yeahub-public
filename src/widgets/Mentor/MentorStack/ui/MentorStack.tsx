import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Mentor } from '@/shared/config/i18n/i18nTranslations';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { ADVANCED_STACK, MAIN_STACK } from '../model/costants/mentorStackConstants';
import styles from './MentorStack.module.css';
import { MentorStackColumns } from './MentorStackColumns/MentorStackColumns';
import { MentorStackDescription } from './MentorStackDescription/MentorStackDescription';
import { MentorStackHeader } from './MentorStackHeader/MentorStackHeader';

export const MentorStack = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section className="stack">
			<Flex direction="column" className={styles['stack-wrapper']}>
				<MentorStackHeader />
				<Card className={styles['stack-card']}>
					<Flex className={styles['stack-content']}>
						<MentorStackDescription
							description1={t(Mentor.STACK_DESCRIPTION_1)}
							description2={t(Mentor.STACK_DESCRIPTION_2)}
						/>
						<MentorStackColumns
							mainTitle={t(Mentor.STACK_MAIN_TITLE)}
							mainRows={MAIN_STACK}
							advancedTitle={t(Mentor.STACK_ADVANCED_TITLE)}
							advancedRows={ADVANCED_STACK}
						/>
					</Flex>
				</Card>
			</Flex>
		</section>
	);
};
