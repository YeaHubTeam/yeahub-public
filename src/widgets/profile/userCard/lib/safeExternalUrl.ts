export const safeExternalUrl = (value: string): string | null => {
	try {
		const url = new URL(value);
		if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
		return url.href;
	} catch {
		return null;
	}
};
