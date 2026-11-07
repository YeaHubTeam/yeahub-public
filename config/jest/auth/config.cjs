/* global module */
module.exports = {
	rootDir: '../../..',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/src/entities/session/**/*.test.{ts,tsx}'],
	transform: { '^.+\\.tsx?$': '<rootDir>/config/jest/auth/transform.cjs' },
	moduleNameMapper: {
		'^server-only$': '<rootDir>/config/jest/auth/server-only.cjs',
		'[.]css$': 'identity-obj-proxy',
		'[.]svg$': '<rootDir>/config/jest/auth/svg.cjs',
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	cacheDirectory: '/tmp/yeahub-auth-jest',
	clearMocks: true,
};
