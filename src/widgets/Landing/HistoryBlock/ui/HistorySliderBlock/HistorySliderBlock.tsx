'use client';

import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Slider } from '@/shared/ui/Slider';

import { historySlides, sliderSettings } from '../../model/constants';
import { HistorySlide } from '../HistorySlide/HistorySlide';
import styles from './HistorySliderBlock.module.css';

export const HistorySliderBlock = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<div className={styles['slider-block']}>
			<div className={styles['image-slider-container']}>
				<Slider {...sliderSettings} className={styles['slider-container-history']}>
					{historySlides.map((slide) => (
						<HistorySlide
							key={slide.id}
							src={slide.src}
							alt={t(Landing[slide.altKey as keyof typeof Landing])}
							text={t(Landing[slide.textKey as keyof typeof Landing])}
						/>
					))}
				</Slider>
			</div>
		</div>
	);
};
