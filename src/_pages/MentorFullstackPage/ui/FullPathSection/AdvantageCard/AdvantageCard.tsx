import Image, { StaticImageData } from 'next/image';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import styles from './AdvantageCard.module.css';

interface AdvantageCardProps {
	title: string;
	description: string;
	imageSrc: string | StaticImageData;
	imgAlt: string;
}

export const AdvantageCard = ({ title, description, imageSrc, imgAlt }: AdvantageCardProps) => {
	return (
		<Card className={styles['card']}>
			<div>
				<Text variant="head3" className={styles['title']}>
					{title}
				</Text>
				<Text variant="body3-accent" className={styles['description']}>
					{description}
				</Text>
			</div>
			<Image src={imageSrc} alt={imgAlt} className={styles['image']} />
		</Card>
	);
};
