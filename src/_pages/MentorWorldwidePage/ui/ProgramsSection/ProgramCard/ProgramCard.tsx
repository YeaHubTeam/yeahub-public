import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { FullstackShape } from '../assets/FullstackShape';
import { ShapeSVG } from '../assets/ShapeSVG';
import styles from './ProgramCard.module.css';

interface ProgramCardProps {
	variant: 'frontend' | 'fullstack';
	badge: string;
	title: string;
	description: string;
	chips: string[];
	button: string;
	href: string;
}

export const ProgramCard = ({
	variant,
	badge,
	title,
	description,
	chips,
	button,
	href,
}: ProgramCardProps) => {
	return (
		<Card className={styles.card} contentClassName={styles.content} withOutsideShadow>
			<div className={styles.cover}>
				<div className={styles['fill-base']} />
				<div className={styles['fill-glow']} />
				<div className={styles['fill-glow']} />
				<div className={styles['fill-violet']} />
				{variant === 'frontend' ? (
					<ShapeSVG className={styles['react-shape']} aria-hidden="true" />
				) : (
					<FullstackShape className={styles['fullstack-shape']} aria-hidden="true" />
				)}
			</div>
			<Chip disablePointer label={badge} className={styles.badge} />
			<Flex direction="column" gap="8" className={styles.copy}>
				<Text variant="head3" className={styles.title}>
					{title}
				</Text>
				<Text variant="body3" color="black-500" className={styles.description}>
					{description}
				</Text>
			</Flex>
			<Flex wrap="wrap" gap="8" className={styles.chips}>
				{chips.map((chip) => (
					<Chip key={chip} disablePointer label={chip} className={styles.chip} />
				))}
			</Flex>
			<Button variant="primary" size="large" fullWidth className={styles.button} href={href}>
				{button}
			</Button>
		</Card>
	);
};
