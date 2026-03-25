import { useTranslations } from 'next-intl';

import { Skill } from '@/entities/skill';
import { Landing, i18Namespace } from '@/shared/config';

import { CardLayout } from '../CardLayout/CardLayout';
import { SkillsBlock } from './SkillsBlock/SkillsBlock';

interface SkillsCardProps {
	skills: Skill[];
}

export const SkillsCard = ({ skills }: SkillsCardProps) => {
	const t = useTranslations(i18Namespace.landing);
	return (
		<CardLayout
			contentSlot={<SkillsBlock skills={skills} />}
			title={t(Landing.SKILLS_TITLE)}
			description={t(Landing.SKILLS_DESCRIPTION)}
		/>
	);
};
