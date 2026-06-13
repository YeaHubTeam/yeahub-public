import Image from 'next/image';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TrainingCardProps } from '../../model/types/trainingType';
import styles from './TrainingCard.module.css';

export const TrainingCard = ({
	id,
	title,
	description,
	to,
	disabled,
	images,
	reverse,
	disabledText,
}: TrainingCardProps) => {
	const t = useTranslations(i18Namespace.newLanding);
	return (
		<Flex
			className={classNames(styles['card-wrapper'], { [styles.reverse]: reverse })}
			direction={'column'}
			gap="16"
		>
			<Card
				actionTitle={title}
				actionRoute={to}
				actionPositionX="start"
				actionDisabled={disabled}
				className={styles['description-card']}
			>
				<Flex justify="between" className={styles['title-container']}>
					<Text variant="head3" className={styles.title}>
						{title}
					</Text>
					{disabled && (
						<Text variant="body5-accent" className={styles.disabled}>
							{disabledText}
						</Text>
					)}
				</Flex>
				<Text variant="body3" className={styles['card-text']}>
					{description}
				</Text>
			</Card>

			<div className={styles['image-container']}>
				{images.map((img) => (
					<Image
						key={img.id}
						src={img.src}
						alt={t(img.alt) + `, ${img.position} image`}
						loading="lazy"
						className={classNames(styles.image, styles[`image-${id}-${img.position}`], {
							[styles['image-materials']]: id === 'materials',
						})}
					/>
				))}
			</div>
		</Flex>
	);
};
