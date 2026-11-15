import { headers } from 'next/headers';

import { createActionURL, setEnvDefaults } from '@auth/core';
import type { AuthConfig } from '@auth/core';
import { getToken } from 'next-auth/jwt';
import 'server-only';

import { deadline, isBackendSession } from './backendSession.server';

// Shared, private cookie verification for server reads and mutations.
export const currentBackendSession = async (writtenCookie?: string) => {
	try {
		const requestHeaders = await headers();
		const config: AuthConfig = {
			providers: [],
			secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
			basePath: '/api/auth',
		};
		// Match NextAuth's environment defaults, including secret rotation.
		setEnvDefaults(process.env, config, true);
		const url = createActionURL(
			'session',
			requestHeaders.get('x-forwarded-proto') ?? 'https',
			requestHeaders,
			process.env,
			config,
		);
		// Cookie only: do not accept a request Authorization header as a session.
		const token = await getToken({
			req: {
				headers: new Headers({ cookie: writtenCookie ?? requestHeaders.get('cookie') ?? '' }),
			},
			secret: config.secret ?? [],
			secureCookie: url.protocol === 'https:',
		});
		const data = token?.backendSession;
		const now = Math.floor(Date.now() / 1000);
		if (
			!isBackendSession(data) ||
			token?.sub !== data.userId ||
			typeof token.exp !== 'number' ||
			token.exp <= now ||
			deadline(data) <= now
		)
			return { status: 'unauthenticated' } as const;
		if (data.accessExpiresAt <= now) return { status: 'refresh-required' } as const;
		return { status: 'success', data } as const;
	} catch {
		return { status: 'error' } as const;
	}
};
