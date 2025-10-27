import createMiddleware from 'next-intl/middleware';

import { routing } from './src/shared/config';

export default createMiddleware(routing);

export const config = {
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
