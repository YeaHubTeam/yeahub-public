'use client';

import React from 'react';

import { useTranslations } from 'next-intl';

import { gurus } from '@/entities/guru';
import GuruBanner from '@/shared/assets/images/learning/guruBanner.png';
import { Learning, i18Namespace } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Banner } from '@/shared/ui/Banner';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import GuruCard from '../GuruCard/GurusCard';
import styles from './GurusBlock.module.css';

export const GurusBlock = () => {
	const t = useTranslations(i18Namespace.learning);

	const { isMobile } = useScreenSize();

	const gurusWithoutPractice = gurus.filter((guru) => !guru.hasPractice);

	return (
		<Flex direction="column" gap="20">
			<Card>
				<Flex direction="column" gap="20">
					<Flex direction="column" gap="8">
						<Text variant={isMobile ? 'body5-accent' : 'head3'} className={styles.title}>
							{t(Learning.GURU_TITLE)}
						</Text>
						<Text variant="body3" className={styles.description}>
							{t(Learning.GURU_DESCRIPTION)}
						</Text>
					</Flex>

					<div className={styles.grid}>
						{gurusWithoutPractice.map((guru) => (
							<GuruCard key={guru.name} guru={guru} />
						))}
					</div>
				</Flex>
			</Card>
			<Banner
				img={GuruBanner}
				className={'alarm'}
				color="violet"
				description={t(Learning.GURU_BANNER)}
			/>
		</Flex>
	);
};
