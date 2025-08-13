import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const ignores = ['.next', 'node_modules', 'coverage', 'build', 'out'];

// нормализуем чужие пресеты (иногда несут ecmaVersion как строку)
const sanitize = (cfg) => ({
	...cfg,
	languageOptions: {
		...(cfg.languageOptions ?? {}),
		ecmaVersion:
			cfg.languageOptions?.ecmaVersion === 'latest'
				? 'latest'
				: Number(cfg.languageOptions?.ecmaVersion) || 2022,
		sourceType: 'module',
	},
});

// удобная обёртка над compat.extends с нормализацией
const x = (...names) => compat.extends(...names).map(sanitize);

export default [
	{ ignores },

	js.configs.recommended,

	// TS пресет только для *.ts/tsx и с project
	...tseslint.configs.recommendedTypeChecked.map((cfg) => ({
		...cfg,
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			...(cfg.languageOptions ?? {}),
			ecmaVersion: 2022,
			sourceType: 'module',
			parser: tseslint.parser,
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
	})),

	// пресеты через compat
	...x('plugin:react/recommended'),
	...x('plugin:react-hooks/recommended'),
	...x('plugin:jsx-a11y/recommended'),
	...x('next/core-web-vitals'),
	...x('prettier'), // выключает конфликтующие форматирующие правила в ESLint
	...x('plugin:@conarti/feature-sliced/recommended'),

	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parser: tseslint.parser,
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			react: reactPlugin,
			'react-hooks': reactHooks,
			import: importPlugin,
			'jsx-a11y': jsxA11y,
			prettier: prettierPlugin,
		},
		settings: {
			react: { version: 'detect' },
			// чтобы import плагин корректно понимал алиасы и ts
			'import/resolver': {
				typescript: {
					project: './tsconfig.json',
				},
				node: true,
			},
		},
		rules: {
			// ⛔️ Пусть сортирует и ставит пустые строки только Prettier
			'import/order': 'off',

			// Показывать ошибки форматирования Prettier в ESLint-выводе (по желанию)
			'prettier/prettier': ['error', { pluginSearchDirs: ['.'] }],

			// React/TS правила как были
			'react/function-component-definition': [
				'error',
				{ namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
			],
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',

			'@typescript-eslint/no-shadow': 'off',
			'@typescript-eslint/ban-ts-comment': 'error',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],

			// Прочее
			'import/prefer-default-export': 'off',
			'import/extensions': 'off',
			'import/no-absolute-path': 'off',
			'no-console': 1,

			// пустые строки пускай контролирует Prettier, чтобы не конфликтовать
			'padding-line-between-statements': 'off',

			// FSD-правило отключено как у тебя
			'@conarti/feature-sliced/absolute-relative': 'off',
		},
		linterOptions: { reportUnusedDisableDirectives: true },
	},

	// Можно добавить оверрайды специально для тестов/сета пов:
	{
		files: ['**/*.test.{ts,tsx}', 'jest.setup.ts', 'config/jest/**/*.ts'],
		rules: {
			// примеры ослаблений, если вдруг будет нужно:
			// '@typescript-eslint/no-unsafe-return': 'off',
			// '@typescript-eslint/no-require-imports': 'off',
		},
	},
];
