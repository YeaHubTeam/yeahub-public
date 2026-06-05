import { HhTopBySpecResponse } from '@/entities/hh';
import { Specializations } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/widgets/Specialization/SectionWrapper';

interface SkillsSectionProps {
	skills: HhTopBySpecResponse['skills'];
}

export const SkillsSection = ({ skills = [] }: SkillsSectionProps) => {
	if (!skills.length) {
		return null;
	}

	return (
		<SectionWrapper title={Specializations.SKILLS_SUBTITLE}>
			<Flex gap="16" wrap="wrap">
				{skills.map((skill) => (
					<Chip key={skill.title} label={skill.title} variant="big" />
				))}
			</Flex>
		</SectionWrapper>
	);
};
