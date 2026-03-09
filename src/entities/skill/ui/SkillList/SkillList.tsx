'use client';

import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import { Skill } from '@/entities/skill';
import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/libs';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';

interface SkillListProps {
	skills: Skill[];
	route?: string;
}

export const SkillList = ({ skills, route }: SkillListProps) => {
	const searchParams = useSearchParams();
	const params = useParams();
	const locale = useLocale();
	const router = useRouter();
	const onClick = (skillId: number) => {
		if (!route) {
			const specializationParam = params?.specialization;
			const specializationSlug =
				(Array.isArray(specializationParam) ? specializationParam[0] : specializationParam) ||
				searchParams?.get('specialization') ||
				DEFAULT_SPECIALIZATION_SLUG;
			router.push(`/${locale}/questions/${specializationSlug}?page=1&status=all&skills=${skillId}`);
		} else {
			router.push(`${route}?page=1&status=all&skills=${skillId}`);
		}
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
