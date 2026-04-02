'use client';

import Image from 'next/image';

import { useScreenSize } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { strategyBlock } from '../../model/constants/constants';
import { StrategyElement } from '../../model/types/types';
import { LightningIcon } from '../LightningIcon/LightningIcon';
import styles from './StrategyBlockList.module.css';

export const StrategyBlockList = () => {
	const { isMobile } = useScreenSize();

	return (
		<ul className={styles.grid}>
			{strategyBlock.map((el: StrategyElement) => (
				<li key={el.id} className={`${styles.card} ${styles['grid-item']}`}>
					{!el.imgPhone ? (
						el.lightningIcon && el.imgBoolean && el.imgSrc ? (
							<Flex justify="between">
								<LightningIcon />
								<Image
									className={styles['mentor-img']}
									height={isMobile ? el.heightMin : (el.heightMax ?? undefined)}
									width={isMobile ? el.widthMin : (el.widthMax ?? undefined)}
									src={el.imgSrc}
									alt={el.alt}
								/>
							</Flex>
						) : (
							<LightningIcon />
						)
					) : null}
					<Flex direction="column" gap="8">
						<Text variant="body6" className={styles.title}>
							{el.title}
						</Text>
						<Text variant="body3-accent">{el.description}</Text>
					</Flex>
					{el.imgBoolean && el.imgPhone && el.imgSrc ? (
						<div className={styles['mentor-img-phone-wrapper']}>
							<Image
								className={styles['mentor-img-phone']}
								width={isMobile ? el.widthMin : (el.widthMax ?? undefined)}
								src={el.imgSrc}
								alt={el.alt}
							/>
						</div>
					) : null}
				</li>
			))}
		</ul>
	);
};
