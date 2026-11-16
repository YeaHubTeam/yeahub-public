import { yupResolver } from '@hookform/resolvers/yup';
import { createTranslator } from 'next-intl';
import profile from 'public/locales/ru/profile.json';

import { createSkillsSchema } from './skillsSchema';

const t = createTranslator({ locale: 'ru', messages: profile });
const messages = {
	required: 'Обязательное поле',
	invalid: t('edit.skills.validation.invalid'),
	duplicate: t('edit.skills.validation.duplicate'),
};
const schema = createSkillsSchema(messages);
it.each([[], [999], [1, 999], Array.from({ length: 101 }, (_, i) => i + 1)].map((ids) => [ids]))(
	'preserves full valid arrays: %j',
	async (ids) => {
		expect(await schema.validate({ profileSkills: ids })).toEqual({ profileSkills: ids });
	},
);
it.each(
	[
		undefined,
		null,
		'1',
		{},
		[0],
		[-1],
		[1.2],
		[NaN],
		[Infinity],
		['1'],
		[null],
		[undefined],
		[Number.MAX_SAFE_INTEGER + 1],
	].map((ids) => [ids]),
)('rejects malformed IDs and arrays: %j', async (ids) => {
	await expect(schema.validate({ profileSkills: ids })).rejects.toThrow();
});
it('rejects duplicate IDs with the localized message', async () => {
	await expect(schema.validate({ profileSkills: [1, 1] })).rejects.toThrow(messages.duplicate);
});
it('uses the localized invalid message', async () => {
	await expect(schema.validate({ profileSkills: [0] })).rejects.toThrow(messages.invalid);
});
it('is compatible with RHF yupResolver without filtering IDs against options', async () => {
	const result = await yupResolver(schema)({ profileSkills: [999, 1] }, undefined, {
		fields: {},
		shouldUseNativeValidation: false,
	});
	expect(result).toEqual({ values: { profileSkills: [999, 1] }, errors: {} });
});
