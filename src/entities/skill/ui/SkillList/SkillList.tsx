'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Skill } from '@/entities/skill';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';

interface SkillListProps {
	skills: Skill[];
	route?: string;
}

export const SkillList = ({ skills, route }: SkillListProps) => {
	const router = useRouter();
	const onClick = (skillId: number) => {
		if (!route) return;

		router.push(`${route}?page=1&status=all&skills=${skillId}`);
	};

	return (
		<Flex componentType="ul" gap="10" wrap="wrap">
			{skills?.map((skill) => {
				return (
					<li key={skill.id}>
						<Chip
							onClick={() => onClick(skill.id)}
							label={skill.title}
							theme="primary"
							active
							prefix={
								skill.imageSrc && (
									<Image width={20} height={20} src={skill.imageSrc} alt={skill.title} />
								)
							}
						/>
					</li>
				);
			})}
		</Flex>
	);
};
