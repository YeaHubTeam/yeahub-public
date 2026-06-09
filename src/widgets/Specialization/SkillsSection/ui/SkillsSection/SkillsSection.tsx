import { Skill } from '@/entities/skill';
import { Specializations } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { CollapsibleChipGrid } from '@/widgets/Specialization/CollapsibleChipGrid';
import { SectionWrapper } from '@/widgets/Specialization/SectionWrapper';

interface SkillsSectionProps {
	skills?: Skill[];
}

export const SkillsSection = ({ skills = [] }: SkillsSectionProps) => {
	if (!skills.length) {
		return null;
	}

	return (
		<SectionWrapper title={Specializations.SKILLS_SUBTITLE}>
			<CollapsibleChipGrid>
				{skills.map((skill) => (
					<Chip key={skill.id} label={skill.title} variant="big" />
				))}
			</CollapsibleChipGrid>
		</SectionWrapper>
	);
};
