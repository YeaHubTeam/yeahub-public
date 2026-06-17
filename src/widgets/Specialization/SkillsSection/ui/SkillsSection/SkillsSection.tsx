import { useTranslations } from 'next-intl';

import { Skill } from '@/entities/skill';
import { Specializations, i18Namespace } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';
import { CollapsibleChipGrid } from '@/widgets/Specialization/CollapsibleChipGrid';

interface SkillsSectionProps {
	skills?: Skill[];
}

export const SkillsSection = ({ skills = [] }: SkillsSectionProps) => {
	const t = useTranslations(i18Namespace.specialization);

	if (!skills.length) {
		return null;
	}

	return (
		<SectionWrapper title={t(Specializations.SKILLS_SUBTITLE)}>
			<CollapsibleChipGrid>
				{skills.map((skill) => (
					<Chip key={skill.id} label={skill.title} variant="big" />
				))}
			</CollapsibleChipGrid>
		</SectionWrapper>
	);
};
