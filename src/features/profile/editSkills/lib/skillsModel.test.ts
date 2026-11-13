import {
	addSkillId,
	getAvailableSkills,
	getInitialSkillIds,
	mergeSkillMetadata,
	removeSkillId,
	sameSkillMetadata,
} from './skillsModel';

const skills = [
	{ id: 999, title: 'Outside', imageSrc: null },
	{ id: 3, title: 'React' },
];
it('initializes every profile ID, including IDs outside the catalogue, without duplicates', () => {
	expect(getInitialSkillIds([...skills, skills[0]])).toEqual([999, 3]);
	expect(skills).toHaveLength(2);
});
it('preserves API order, excludes selected IDs and duplicate options', () => {
	expect(
		getAvailableSkills(
			[
				{ id: 8, title: 'Eight' },
				...skills,
				{ id: 8, title: 'Duplicate' },
				{ id: 0, title: 'Invalid' },
			],
			[999],
		),
	).toEqual([
		{ value: '8', label: 'Eight' },
		{ value: '3', label: 'React' },
	]);
});
it('adds and removes only explicitly chosen IDs', () => {
	expect(addSkillId([999], 3)).toEqual([999, 3]);
	expect(addSkillId([999, 3], 3)).toEqual([999, 3]);
	expect(removeSkillId([999, 3], 3)).toEqual([999]);
	expect(addSkillId([999], NaN)).toEqual([999]);
});
it('does not impose a maximum of 100 selected IDs', () => {
	const ids = Array.from({ length: 101 }, (_, i) => i + 1);
	expect(addSkillId(ids, 999)).toHaveLength(102);
});
it('merges trusted metadata independently of IDs and retains profile titles and missing icons', () => {
	const dictionary = mergeSkillMetadata([{ id: 999, title: 'Option' }], skills);
	expect(dictionary[999]).toEqual(skills[0]);
	expect(dictionary[3].imageSrc).toBeNull();
	expect(sameSkillMetadata(dictionary, mergeSkillMetadata(skills))).toBe(true);
	expect(sameSkillMetadata(dictionary, {})).toBe(false);
});
