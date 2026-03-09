'use client';

import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';

import { CardLayout } from '../CardLayout/CardLayout';
import { SpecializationBlock } from './SpecializationBlock/SpecializationBlock';

export const SpecializationCard = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<CardLayout
			contentSlot={<SpecializationBlock />}
			title={t(Landing.SPECIALIZATION_NEW_TITLE)}
			description={t(Landing.SPECIALIZATION_DESCRIPTION)}
		/>
	);
};
