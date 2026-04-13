import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './InfoCardSkilled.module.css';

interface InfoCardSkilledProps {
	title: string;
	description: string;
	buttonText: string;
	badgeInstead: string;
	badgePostpay: string;
}

export const InfoCardSkilled = ({
	title,
	description,
	buttonText,
	badgeInstead,
	badgePostpay,
}: InfoCardSkilledProps) => {
	return (
		<div className={styles['info-card-skilled']}>
			<Flex className={styles['info-card']} align="start">
				<Flex direction="column" className={styles['content']}>
					<Badge
						icon="lightning"
						wrapperClassName={styles['icon-wrapper']}
						className={styles.icon}
					/>
					<Text variant="body3" className={styles['title']}>
						{title}
					</Text>
					<Text variant="body3" color="black-900" className={styles['description']}>
						{description}
					</Text>
					<Button variant="primary" size="medium" fullWidth className={styles['button']}>
						{buttonText}
					</Button>
				</Flex>

				<Flex align="start" className={styles['badges']}>
					<div className={styles['badge-red']}>
						<Text variant="head2" color="white-900">
							150%
						</Text>
						<Text variant="body3" color="white-900">
							{badgeInstead}
						</Text>
					</div>
					<div className={styles['badge-outline']}>
						<Text
							variant="body3-strong"
							color="purple-900"
							className={styles['badge-outline-text']}
						>
							100%
						</Text>
						<Text variant="body3" color="black-700">
							{badgePostpay}
						</Text>
					</div>
				</Flex>
			</Flex>
		</div>
	);
};
