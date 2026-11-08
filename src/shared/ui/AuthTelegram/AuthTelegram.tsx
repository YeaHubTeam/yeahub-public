import type { ReactNode } from 'react';

import TelegramIcon from '@/shared/assets/icons/telegram.svg';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './AuthTelegram.module.css';

export const AuthTelegram = ({
	caption,
	unavailable,
	children,
}: {
	caption: string;
	unavailable: string;
	children?: ReactNode;
}) => (
	<Flex direction="column" gap="8" align="center">
		<Text variant="body2">{caption}</Text>
		{children ?? (
			<>
				<Button
					type="button"
					variant="secondary"
					disabled
					className={styles.telegram}
					preffix={<TelegramIcon width={24} height={24} aria-hidden="true" />}
					title={unavailable}
					aria-describedby="telegram-unavailable"
				>
					Telegram
				</Button>
				<div id="telegram-unavailable">
					<Text variant="body1">{unavailable}</Text>
				</div>
			</>
		)}
	</Flex>
);
