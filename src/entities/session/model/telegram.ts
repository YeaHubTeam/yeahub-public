export interface TelegramPayload {
	id: number;
	first_name: string;
	auth_date: number;
	hash: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
}

// Structural checks only. Identity and HMAC are verified exclusively by NestJS.
export const parseTelegramPayload = (value: unknown): TelegramPayload | null => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const data = value as Record<string, unknown>;
	const fields = ['id', 'first_name', 'auth_date', 'hash', 'last_name', 'username', 'photo_url'];
	if (Object.keys(data).some((key) => !fields.includes(key))) return null;
	const integer = (v: unknown) =>
		typeof v === 'number' ? v : typeof v === 'string' && /^[1-9]\d*$/.test(v) ? Number(v) : NaN;
	const id = integer(data.id),
		auth_date = integer(data.auth_date);
	if (
		!Number.isSafeInteger(id) ||
		id <= 0 ||
		!Number.isSafeInteger(auth_date) ||
		auth_date <= 0 ||
		typeof data.first_name !== 'string' ||
		!data.first_name ||
		data.first_name.length > 256 ||
		typeof data.hash !== 'string' ||
		!/^[a-f0-9]{64}$/.test(data.hash)
	)
		return null;
	for (const key of ['last_name', 'username'] as const)
		if (data[key] !== undefined && (typeof data[key] !== 'string' || data[key].length > 256))
			return null;
	if (data.photo_url !== undefined) {
		if (typeof data.photo_url !== 'string' || data.photo_url.length > 2048) return null;
		try {
			const url = new URL(data.photo_url);
			if (url.protocol !== 'https:' || url.username || url.password) return null;
		} catch {
			return null;
		}
	}
	return {
		id,
		auth_date,
		first_name: data.first_name,
		hash: data.hash,
		...(data.last_name !== undefined ? { last_name: data.last_name as string } : {}),
		...(data.username !== undefined ? { username: data.username as string } : {}),
		...(data.photo_url !== undefined ? { photo_url: data.photo_url } : {}),
	};
};

// Public bot username only; never accepts a bot token, URL, or arbitrary script expression.
export const configuredTelegramBot = (name: unknown, origin: unknown): string | undefined => {
	if (
		typeof name !== 'string' ||
		!/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(name) ||
		!/bot$/i.test(name) ||
		typeof origin !== 'string'
	)
		return undefined;
	try {
		const url = new URL(origin);
		if (
			url.protocol !== 'https:' ||
			!url.hostname.includes('.') ||
			url.hostname === 'localhost' ||
			url.hostname.endsWith('.localhost') ||
			/^[\d.]+$/.test(url.hostname) ||
			url.username ||
			url.password ||
			url.pathname !== '/' ||
			url.search ||
			url.hash
		)
			return undefined;
		return name;
	} catch {
		return undefined;
	}
};
