import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';
import { AccordionMentor } from '@/shared/ui/AccordionMentor';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './FaqList.module.css';

export const FaqList = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	const steps = [
		{
			id: '01',
			title: MentorWorldwide.FAQ_STEPS_01_TITLE,
			description: MentorWorldwide.FAQ_STEPS_01_DESCRIPTION,
		},
		{
			id: '02',
			title: MentorWorldwide.FAQ_STEPS_02_TITLE,
			description: MentorWorldwide.FAQ_STEPS_02_DESCRIPTION,
		},
		{
			id: '03',
			title: MentorWorldwide.FAQ_STEPS_03_TITLE,
			description: MentorWorldwide.FAQ_STEPS_03_DESCRIPTION,
		},
		{
			id: '04',
			title: MentorWorldwide.FAQ_STEPS_04_TITLE,
			description: MentorWorldwide.FAQ_STEPS_04_DESCRIPTION,
		},
		{
			id: '05',
			title: MentorWorldwide.FAQ_STEPS_05_TITLE,
			description: MentorWorldwide.FAQ_STEPS_05_DESCRIPTION,
		},
		{
			id: '06',
			title: MentorWorldwide.FAQ_STEPS_06_TITLE,
			description: MentorWorldwide.FAQ_STEPS_06_DESCRIPTION,
		},
		{
			id: '07',
			title: MentorWorldwide.FAQ_STEPS_07_TITLE,
			description: MentorWorldwide.FAQ_STEPS_07_DESCRIPTION,
		},
	];

	return (
		<Flex direction="column" gap="20" className={styles.wrapper}>
			<Flex direction="column" gap="20" className={styles.content}>
				{steps.map(({ id, title, description }) => (
					<AccordionMentor key={id} number={id} title={t(title)} defaultOpen={false}>
						<Text variant="body3-accent" className={styles.answer}>
							{t(description)}
						</Text>
					</AccordionMentor>
				))}
			</Flex>
		</Flex>
	);
};
