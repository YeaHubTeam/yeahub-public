import { useTranslations } from 'next-intl';

import { HhTopBySpecResponse } from '@/entities/hh';
import { Specializations, i18Namespace } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

interface SkillsSectionProps {
	skills?: HhTopBySpecResponse['skills'];
}

export const SkillsSection = ({ skills = [] }: SkillsSectionProps) => {
	const t = useTranslations(i18Namespace.specialization);

	if (!skills.length) {
		return null;
	}

	return (
		<SectionWrapper title={t(Specializations.SKILLS_SUBTITLE)}>
			<Flex gap="16" wrap="wrap">
				{skills.map((skill) => (
					<Chip key={skill.title} label={skill.title} variant="big" />
				))}
			</Flex>
		</SectionWrapper>
	);
};
