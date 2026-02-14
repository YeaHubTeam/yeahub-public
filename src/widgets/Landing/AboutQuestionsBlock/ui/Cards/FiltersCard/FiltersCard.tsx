'use client';

import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';

import { blocks } from '../../../model/constants';
import { CardLayout } from '../CardLayout/CardLayout';

export const FiltersCard = () => {
	const t = useTranslations(i18Namespace.landing);
	return (
		<CardLayout
			contentSlot={
				<Image
					width={241}
					height={206}
					src={blocks.filters.src}
					alt={blocks.filters.alt}
					data-testid="FiltersCard_Img"
				/>
			}
			title={t(Landing.FILTERS_TITLE)}
			description={t(Landing.FILTERS_DESCRIPTION)}
		/>
	);
};
