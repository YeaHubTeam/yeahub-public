import Image, { StaticImageData } from 'next/image';

import classNames from 'classnames';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import styles from './MentorCard.module.css';

interface MentorCardProps {
	title: string;
	description: string;
	imageSrc: string | StaticImageData;
}

export const MentorCard = ({ title, description, imageSrc }: MentorCardProps) => {
	return (
		<Card className={classNames(styles['card'], styles['card-header'])}>
			<Text variant="body6" className={styles.title}>
				{title}
			</Text>
			<p className={styles['description']}>{description}</p>
			<Image src={imageSrc} alt={title} width={352} height={258} />
		</Card>
	);
};
