import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { AccordionMentor } from '@/shared/ui/AccordionMentor';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './FaqList.module.css';

export const FaqList = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	const steps = [
		{
			id: '01',
			title: MentorFullstack.FAQ_STEPS_01_TITLE,
			description: MentorFullstack.FAQ_STEPS_01_DESCRIPTION,
		},
		{
			id: '02',
			title: MentorFullstack.FAQ_STEPS_02_TITLE,
			description: MentorFullstack.FAQ_STEPS_02_DESCRIPTION,
		},
		{
			id: '03',
			title: MentorFullstack.FAQ_STEPS_03_TITLE,
			description: MentorFullstack.FAQ_STEPS_03_DESCRIPTION,
		},
		{
			id: '04',
			title: MentorFullstack.FAQ_STEPS_04_TITLE,
			description: MentorFullstack.FAQ_STEPS_04_DESCRIPTION,
		},
		{
			id: '05',
			title: MentorFullstack.FAQ_STEPS_05_TITLE,
			description: MentorFullstack.FAQ_STEPS_05_DESCRIPTION,
		},
		{
			id: '06',
			title: MentorFullstack.FAQ_STEPS_06_TITLE,
			description: MentorFullstack.FAQ_STEPS_06_DESCRIPTION,
		},
		{
			id: '07',
			title: MentorFullstack.FAQ_STEPS_07_TITLE,
			description: MentorFullstack.FAQ_STEPS_07_DESCRIPTION,
		},
		{
			id: '08',
			title: MentorFullstack.FAQ_STEPS_08_TITLE,
			description: MentorFullstack.FAQ_STEPS_08_DESCRIPTION,
		},
		{
			id: '09',
			title: MentorFullstack.FAQ_STEPS_09_TITLE,
			description: MentorFullstack.FAQ_STEPS_09_DESCRIPTION,
		},
		{
			id: '10',
			title: MentorFullstack.FAQ_STEPS_10_TITLE,
			description: MentorFullstack.FAQ_STEPS_10_DESCRIPTION,
		},
	];

	return (
		<Flex direction="column" gap="20" className={styles.wrapper}>
			<Flex direction="column" gap="20" className={styles.content}>
				{steps.map(({ id, title, description }) => (
					<AccordionMentor key={id} number={id} title={t(title)} defaultOpen={false}>
						<Text variant="body3-accent">{t(description)}</Text>
					</AccordionMentor>
				))}
			</Flex>
		</Flex>
	);
};
