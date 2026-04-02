import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Mentor } from '@/shared/config/i18n/i18nTranslations';
import { Flex } from '@/shared/ui/Flex';
import { SectionLabel } from '@/shared/ui/SectionLabel';
import { Text } from '@/shared/ui/Text';

import styles from './MentorEducationHeader.module.css';

export const MentorEducationHeader = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<div className={styles.wrapper}>
			<SectionLabel text={t(Mentor.EDUCATION_LABEL)} />
			<Flex className={styles.block} direction="column" gap="10">
				<Text className={styles.title} variant="head2" color="black-900">
					{t(Mentor.EDUCATION_TITLE)}
				</Text>
				<Text variant="body3-accent" color="black-900">
					{t(Mentor.EDUCATION_DESCRIPTION)}
				</Text>
			</Flex>
		</div>
	);
};
