import nextJest from 'next/jest.js';

import type { Config } from 'jest';

const createJestConfig = nextJest({
	dir: './',
});

const customConfig: Config = {
	// Глобальные флаги из старого проекта — оставляю, если используешь
	globals: { __IS_DEV__: true },

	clearMocks: true,

	// Полифилы (TextEncoder/Decoder, fetch, ReadableStream, Blob/File и т.п.)
	setupFiles: ['<rootDir>/config/jest/jest.polyfill.ts'],

	// Jest-DOM, matchMedia, BroadcastChannel, mock роутера
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

	testEnvironment: 'jsdom',

	testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
	testMatch: ['<rootDir>/src/**/*(*.)@(spec|test).[tj]s?(x)'],

	moduleNameMapper: {
		// SVG как React-компонент (мок)
		'\\.svg$': '<rootDir>/config/jest/jestSvgMock.tsx',

		// Статика → строка
		'^.+\\.(jpg|ico|jpeg|png|gif|avif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/config/jest/jestFileMock.ts',

		// CSS / CSS Modules
		'\\.(css|scss|sass|less)$': 'identity-obj-proxy',

		// Алиас "@/..."
		'^@/(.*)$': '<rootDir>/src/$1',
	},

	// Нужно для корректной загрузки условных экспортов React/Next в jsdom
	testEnvironmentOptions: {
		customExportConditions: ['react-server', 'development'],
	},
};

export default createJestConfig(customConfig);
