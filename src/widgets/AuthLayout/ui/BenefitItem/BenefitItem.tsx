import CheckCircle from '@/shared/assets/icons/checkCircle1.svg';
import { Text } from '@/shared/ui/Text';

import styles from './BenefitItem.module.css';

interface BenefitItemProps {
	text: string;
}

export const BenefitItem = ({ text }: BenefitItemProps) => {
	return (
		<li className={styles['text-wrapper']}>
			<span className={styles['icon-wrapper']}>
				<CheckCircle width={18} height={18} />
			</span>
			<Text variant="body3" className={styles.text}>
				{text}
			</Text>
		</li>
	);
};
