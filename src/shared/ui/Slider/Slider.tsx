'use client';

import { ReactNode, useEffect, useState } from 'react';

import SlickSlider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import { Flex } from '@/shared/ui/Flex';

const baseSliderSettings = {
	dots: false,
	infinite: true,
	arrows: false,
	speed: 300,
	variableWidth: true,
};

interface SliderProps extends Settings {
	children: ReactNode;
}

export const Slider = ({ children, ...customSliderSettings }: SliderProps) => {
	const sliderSettings = { ...baseSliderSettings, ...customSliderSettings };

	const [isRender, setIsRender] = useState(false);

	useEffect(() => {
		if (!isRender) {
			setIsRender(true);
		}
	}, []);

	if (!isRender) {
		return (
			<Flex gap="16" className={customSliderSettings.className}>
				{children}
			</Flex>
		);
	}

	return <SlickSlider {...sliderSettings}>{children}</SlickSlider>;
};
