import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Mentor } from '@/shared/config/i18n/i18nTranslations';
import { Flex } from '@/shared/ui/Flex';
import { SectionLabel } from '@/shared/ui/SectionLabel';
import { Text } from '@/shared/ui/Text';

import styles from './MentorStackHeader.module.css';

export const MentorStackHeader = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<div className={styles['header-wrapper']}>
			<SectionLabel text={t(Mentor.STACK_LABEL)} />
			<Flex className={styles['header-block']} direction="column" gap="12">
				<Text className={styles['header-title']} variant="head3" color="black-900">
					{t(Mentor.STACK_TITLE)}
				</Text>
				<Text variant="body3-accent" color="black-900" className={styles['header-subtitle']}>
					{t(Mentor.STACK_SUBTITLE)}
				</Text>
			</Flex>
		</div>
	);
};
