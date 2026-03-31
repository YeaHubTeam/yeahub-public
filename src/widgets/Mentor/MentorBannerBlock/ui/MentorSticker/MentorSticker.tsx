import { Flex } from '@/shared/ui/Flex';
import { IconBadge } from '@/shared/ui/IconBadge';
import { Text } from '@/shared/ui/Text';

import styles from './MentorSticker.module.css';

interface MentorStickerProps {
	text: string;
	className?: string;
}

export const MentorSticker = ({ text }: MentorStickerProps) => {
	return (
		<Flex align="center" gap="6" className={styles.sticker}>
			<IconBadge icon="lightning" className={styles['icon-wrapper']} iconClassName={styles.icon} />
			<Text variant="body2-accent" color="red-600" className={styles.text}>
				{text}
			</Text>
		</Flex>
	);
};
