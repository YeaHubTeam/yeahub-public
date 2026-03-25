import { Skill } from '@/entities/skill';
import { Flex } from '@/shared/ui/Flex';

import { SkillChip } from '../../../SkillChip/SkillChip';
import { CardBlockLayout } from '../../CardBlockLayout/CardBlockLayout';

interface SkillsBlockProps {
	skills: Skill[];
}

export const SkillsBlock = ({ skills }: SkillsBlockProps) => {
	return (
		<CardBlockLayout>
			<Flex gap="16">
				{skills.slice(0, 2).map(({ imageSrc, title }) => (
					<SkillChip key={title} src={imageSrc} alt={title} />
				))}
			</Flex>
			<Flex gap="16">
				{skills.slice(2, 5).map(({ imageSrc, title }) => (
					<SkillChip key={title} src={imageSrc} alt={title} />
				))}
			</Flex>
			<Flex gap="16">
				{skills.slice(5, 9).map(({ imageSrc, title }) => (
					<SkillChip key={title} src={imageSrc} alt={title} />
				))}
			</Flex>
		</CardBlockLayout>
	);
};
