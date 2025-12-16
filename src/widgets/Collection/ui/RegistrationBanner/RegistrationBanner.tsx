'use client';

import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';
import { ROUTES } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './RegistrationBanner.module.css';

interface RegistrationBannerProps {
	questionsCount: number;
}

export const RegistrationBanner = ({ questionsCount }: RegistrationBannerProps) => {
	const t = useTranslations(i18Namespace.translation);
	const { isMobile } = useScreenSize();

	return (
		<Card withOutsideShadow className={styles.card}>
			<Flex
				justify="between"
				align="center"
				direction={isMobile ? 'column' : 'row'}
				gap={isMobile ? '12' : '32'}
			>
				<Text variant={isMobile ? 'body3-accent' : 'body5-accent'} color="black-900">
					{t(Translation.QUESTIONS_COUNT_AVAILABLE_AUTHORIZED, { count: questionsCount })}
				</Text>
				<Button
					size="large"
					variant="link"
					className={styles.button}
					href={ROUTES.login}
					rel="noopener noreferrer"
					target="_blank"
				>
					<Text variant="body3-strong" color="purple-700">
						{t(Translation.LOGIN_REGISTER_LINK)}
					</Text>
				</Button>
			</Flex>
		</Card>
	);
};
