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
		// приводим к числу или 'latest'
		ecmaVersion:
			cfg.languageOptions?.ecmaVersion === 'latest'
				? 'latest'
				: Number(cfg.languageOptions?.ecmaVersion) || 2022,
		sourceType: 'module',
	},
});

// удобная обёртка над compat.extends с нормализацией
const x = (...names) => compat.extends(...names).map(sanitize);

const eslintConfig = [
	{ ignores },

	js.configs.recommended,

	// TS пресет ТОЛЬКО для *.ts/tsx и с project
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

	// пресеты через compat.extends — уже «санитизированные»
	...x('plugin:react/recommended'),
	...x('plugin:react-hooks/recommended'),
	...x('plugin:jsx-a11y/recommended'),
	...x('next/core-web-vitals'),
	...x('prettier'),
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
		settings: { react: { version: 'detect' } },
		rules: {
			'prettier/prettier': 'error',
			'react/function-component-definition': [
				2,
				{ namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
			],
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'@typescript-eslint/no-shadow': 'off',
			'import/prefer-default-export': 'off',
			'import/extensions': 'off',
			'import/no-absolute-path': 'off',
			'no-console': 1,
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
			'import/order': [
				'warn',
				{
					groups: [
						'builtin',      // fs, path...
						'external',     // react, next, lodash...
						'internal',     // src/, @/*
						'parent',       // ../
						'sibling',      // ./
						'index',
						'object',
						'type'
					],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
					pathGroups: [
						{ pattern: 'react', group: 'external', position: 'before' },
						{ pattern: 'next/**', group: 'external', position: 'before' },
						{ pattern: '@/**', group: 'internal', position: 'after' },
						{ pattern: 'src/**', group: 'internal', position: 'after' }
					],
					pathGroupsExcludedImportTypes: ['react', 'next/**']
				}
			],

			// твой пресет на пустые строки можно вернуть позже; сейчас оставим error
			'padding-line-between-statements': 'error',

			// из FSD-плагина явно отключал
			'@conarti/feature-sliced/absolute-relative': 'off',
		},
		linterOptions: { reportUnusedDisableDirectives: true },
	},
];

export default eslintConfig;