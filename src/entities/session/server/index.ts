import { cookies } from 'next/headers';

import 'server-only';

import { ACCESS_COOKIE, readSession } from './transport';

// Только чтение: cookies не изменяются во время RSC render.
export const getCurrentSession = async () =>
	readSession((await cookies()).get(ACCESS_COOKIE)?.value);
export { login, logout, session, refresh } from './handlers';

export { register } from './registration';
