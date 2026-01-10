'use client';

let purifier: typeof import('dompurify') | null = null;

export const normalizeHtmlContent = async (html: string) => {
	if (!purifier) {
		const mod = await import('dompurify');
		purifier = mod.default;
	}

	return purifier.sanitize(html, {
		ADD_TAGS: ['pre', 'code'],
		ADD_ATTR: ['class'],
		FORBID_ATTR: ['style'],
	});
};
