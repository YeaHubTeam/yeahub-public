'use client';

import { useState } from 'react';

export const useCopy = (delay: number = 1000) => {
	const [value, setValue] = useState<string | undefined>();
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async (text: string) => {
		if (typeof window === 'undefined') return;

		try {
			await navigator.clipboard.writeText(text);
			setValue(text);
			setCopied(true);
			setTimeout(() => setCopied(false), delay);
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				return error;
			}
		}
	};

	return { value, copied, copy: copyToClipboard };
};
