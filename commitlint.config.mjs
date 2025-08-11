// eslint-disable-next-line import/no-anonymous-default-export
export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// допустимые типы
		'type-enum': [
			2,
			'always',
			['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert'],
		],
		'header-max-length': [2, 'always', 100],
		// subject без заглавных/точки в конце
		'subject-case': [2, 'always', ['sentence-case', 'lower-case']],
		'subject-full-stop': [2, 'never', '.'],
		// Разрешим номер задачи как scope, если хочешь:
		// пример: feat(YH-1249): configure linters
		'scope-case': [2, 'always', ['kebab-case', 'upper-case', 'pascal-case']],
	},
};
