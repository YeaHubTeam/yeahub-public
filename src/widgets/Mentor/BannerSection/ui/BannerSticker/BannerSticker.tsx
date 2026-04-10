import { Badge } from '@/shared/ui/Badge';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './BannerSticker.module.css';

interface BannerStickerProps {
	text: string;
	className?: string;
}

export const BannerSticker = ({ text }: BannerStickerProps) => {
	return (
		<Flex align="center" gap="6" className={styles.sticker}>
			<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} className={styles.icon} />
			<Text variant="body2-accent" color="red-600" className={styles.text}>
				{text}
			</Text>
		</Flex>
	);
};
