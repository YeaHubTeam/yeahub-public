'use client';

import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';

import { CardLayout } from '../CardLayout/CardLayout';
import { SkillsBlock } from './SkillsBlock/SkillsBlock';

export const SkillsCard = () => {
	const t = useTranslations(i18Namespace.landing);
	return (
		<CardLayout
			contentSlot={<SkillsBlock />}
			title={t(Landing.SKILLS_TITLE)}
			description={t(Landing.SKILLS_DESCRIPTION)}
		/>
	);
};
