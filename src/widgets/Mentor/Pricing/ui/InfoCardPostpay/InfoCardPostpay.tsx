import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './InfoCardPostpay.module.css';

interface InfoCardProps {
	title: string;
	description: string;
	buttonText: string;
	badge?: string;
}

export const InfoCardPostpay = ({ title, description, buttonText, badge }: InfoCardProps) => {
	return (
		<div className={styles['info-card-postpay']}>
			{badge && (
				<div className={styles['badge']}>
					<Text variant="body3-strong" color="green-700">
						{badge}
					</Text>
				</div>
			)}
			<Flex direction="column" gap="10">
				<Text variant="body3" className={styles['title']}>
					{title}
				</Text>
				<Text variant="body3" color="black-900" className={styles['description']}>
					{description}
				</Text>
			</Flex>
			<Button variant="primary" size="medium" fullWidth className={styles['button']}>
				{buttonText}
			</Button>
		</div>
	);
};
