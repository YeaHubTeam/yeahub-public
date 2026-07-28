import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
	...fsd.configs.recommended,
	{
		rules: {
			'fsd/insignificant-slice': 'off',
			'fsd/typo-in-layer-name': 'warn',
			'fsd/excessive-slicing': 'warn',
		},
	},
]);
