'use client';

import React from 'react';

import { useTranslations } from 'next-intl';

import { InterviewStatistics, i18Namespace } from '@/shared/config';
import { Pallete } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TextVariant } from '../../Text/types';
import styles from './GaugeChart.module.css';

interface GaugeChartProps {
	total?: number;
	learned?: number;
	percent?: number;
	text?: boolean;
	sizeCircle?: number;
	widthCircle?: number;
	color?: string;
	backColor?: string;
	fillColor?: string;
	textColor?: Pallete;
	textVariant?: TextVariant;
	textClassName?: string;
}

export const GaugeChart = ({
	total,
	learned,
	percent,
	text,
	sizeCircle,
	widthCircle,
	color,
	backColor,
	fillColor,
	textClassName,
	textColor,
	textVariant,
}: GaugeChartProps) => {
	const t = useTranslations(i18Namespace.interviewStatistics);
	const passedQuestionsPercent =
		percent !== undefined ? percent : Math.round((learned! / total!) * 100);

	const size = sizeCircle || 241;

	const radius = size / 2;
	const strokeWidth = widthCircle || 24;
	const circleRadius = radius - strokeWidth / 2;
	const circumference = 2 * Math.PI * circleRadius;
	const progressOffset = circumference - (passedQuestionsPercent / 100) * circumference;

	return (
		<Flex className={styles['gauge-chart-container']} justify="center" align="center">
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				<circle
					cx={radius}
					cy={radius}
					r={circleRadius}
					stroke={backColor || '#FFE7AE'}
					strokeWidth={strokeWidth}
					fill={fillColor || '#fffaec'}
				/>
				<circle
					className={styles['gauge-progress']}
					cx={radius}
					cy={radius}
					r={circleRadius}
					stroke={color || '#008616'}
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
			<Text
				color={textColor || 'black-700'}
				variant={textVariant || 'body4'}
				className={textClassName || styles['gauge-text']}
			>
				{!isNaN(passedQuestionsPercent) && <span>{passedQuestionsPercent}%</span>}
				{!isNaN(passedQuestionsPercent) && <br />}
				{text && (total ? t(InterviewStatistics.PASSED) : t(InterviewStatistics.SOON))}
			</Text>
		</Flex>
	);
};
