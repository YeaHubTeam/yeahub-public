import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { MentorFullstack, ROUTES, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import terminalImage from '../assets/Terminal.png';
import styles from './DeveloperStackIntro.module.css';

export const DeveloperStackIntro = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<Card withOutsideShadow className={styles.card} contentClassName={styles.body}>
			<Image
				src={terminalImage}
				alt={t(MentorFullstack.DEVELOPER_STACK_INTRO_IMAGE_ALT)}
				className={styles.terminal}
				style={{ height: 'auto' }}
			/>
			<Flex direction="column" gap="16" className={styles.copy}>
				<Text variant="body3" className={styles.text}>
					{t(MentorFullstack.DEVELOPER_STACK_INTRO_FIRST)}
				</Text>
				<Text variant="body3" className={styles.text}>
					{t(MentorFullstack.DEVELOPER_STACK_INTRO_SECOND)}
				</Text>
				<Button
					size="large"
					variant="primary"
					className={styles.button}
					href={ROUTES.mentor.telegram}
					target="_blank"
					rel="noopener noreferrer"
				>
					{t(MentorFullstack.DEVELOPER_STACK_INTRO_BUTTON)}
				</Button>
			</Flex>
		</Card>
	);
};
