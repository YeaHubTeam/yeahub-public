import type { ProfileSkill } from '@/entities/profile';

export type SkillOption = Pick<ProfileSkill, 'id' | 'title'> & { imageSrc?: string | null };
export const isSkillId = (value: unknown): value is number =>
	typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
export const getInitialSkillIds = (skills: readonly SkillOption[]): number[] => [
	...new Set(skills.map((skill) => skill.id)),
];

// The options catalogue must never be used to filter this array.
export const addSkillId = (selected: readonly number[], id: number): number[] =>
	!isSkillId(id) || selected.includes(id) ? [...selected] : [...selected, id];
export const removeSkillId = (selected: readonly number[], id: number): number[] =>
	selected.filter((value) => !Object.is(value, id));
export const mergeSkillMetadata = (
	...groups: readonly (readonly SkillOption[])[]
): Record<number, ProfileSkill> => {
	const result: Record<number, ProfileSkill> = {};
	for (const group of groups)
		for (const skill of group) {
			if (isSkillId(skill.id) && typeof skill.title === 'string' && skill.title.length > 0)
				result[skill.id] = { id: skill.id, title: skill.title, imageSrc: skill.imageSrc ?? null };
		}
	return result;
};
export const sameSkillMetadata = (
	a: Record<number, ProfileSkill>,
	b: Record<number, ProfileSkill>,
) =>
	Object.keys(a).length === Object.keys(b).length &&
	Object.values(a).every(
		(skill) => b[skill.id]?.title === skill.title && b[skill.id]?.imageSrc === skill.imageSrc,
	);
export const getAvailableSkills = (
	options: readonly SkillOption[],
	selected: readonly number[],
) => {
	const seen = new Set<number>(selected);
	return options
		.filter((skill) => {
			if (!isSkillId(skill.id) || !skill.title || seen.has(skill.id)) return false;
			seen.add(skill.id);
			return true;
		})
		.map((skill) => ({ value: String(skill.id), label: skill.title }));
};
