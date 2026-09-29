'use client';

import React from 'react';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { InterviewStatistics, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TextVariant } from '../../Text/types';
import styles from './GaugeChart.module.css';

export type GaugeChartSize = 'small' | 'medium';

export const labelVariants: Record<GaugeChartSize, TextVariant> = {
	small: 'body4',
	medium: 'body5',
} as const;

interface GaugeChartProps {
	total?: number;
	learned?: number;
	percent?: number;
	size?: number;
	strokeWidth?: number;
	progressColor?: string;
	backgroundColor?: string;
	backgroundStrokeColor?: string;
	sizeText?: GaugeChartSize;
	className?: string;
}

export const GaugeChart = ({
	total,
	learned,
	percent,
	size = 241,
	strokeWidth = 24,
	progressColor = '#008616',
	backgroundColor = '#fffaec',
	backgroundStrokeColor = '#FFE7AE',
	sizeText = 'small',
	className,
}: GaugeChartProps) => {
	const t = useTranslations(i18Namespace.interviewStatistics);
	const passedQuestionsPercent =
		percent !== undefined ? percent : Math.round((learned! / total!) * 100);

	const radius = size / 2;
	const circleRadius = radius - strokeWidth / 2;
	const circumference = 2 * Math.PI * circleRadius;
	const progressOffset = circumference - (passedQuestionsPercent / 100) * circumference;

	return (
		<Flex
			className={classNames(styles['gauge-chart-container'], className)}
			justify="center"
			align="center"
		>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				<circle
					cx={radius}
					cy={radius}
					r={circleRadius}
					stroke={backgroundStrokeColor}
					strokeWidth={strokeWidth}
					fill={backgroundColor}
				/>
				<circle
					className={styles['gauge-progress']}
					cx={radius}
					cy={radius}
					r={circleRadius}
					stroke={progressColor}
					strokeWidth={strokeWidth}
					fill="none"
					strokeLinecap="round"
					style={{
						strokeDasharray: circumference,
						strokeDashoffset: progressOffset,
						transition: 'stroke-dashoffset 0.3s ease-in-out',
					}}
				/>
			</svg>
			<Text color="black-700" variant={labelVariants[sizeText]} className={styles['gauge-text']}>
				{!isNaN(passedQuestionsPercent) && <span>{passedQuestionsPercent}%</span>}
				{!isNaN(passedQuestionsPercent) && <br />}
				{total !== undefined &&
					(total ? t(InterviewStatistics.PASSED) : t(InterviewStatistics.SOON))}
			</Text>
		</Flex>
	);
};
