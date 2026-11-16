import type { AvatarFileError } from '../model/types';

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ['image/png', 'image/jpeg', 'image/avif'];
export type AvatarFileResult = { status: 'success'; source: string } | { status: AvatarFileError };

export const readAvatarFile = async (file: File): Promise<AvatarFileResult> => {
	if (!AVATAR_MIME_TYPES.includes(file.type)) return { status: 'format' };
	if (file.size > MAX_AVATAR_BYTES) return { status: 'size' };
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onerror = () => resolve({ status: 'format' });
		reader.onload = () => {
			if (typeof reader.result !== 'string') {
				resolve({ status: 'format' });
				return;
			}
			const source = reader.result;
			const image = new window.Image();
			image.onerror = () => resolve({ status: 'format' });
			image.onload = () => {
				if ([image.naturalWidth, image.naturalHeight].some((side) => side < 128 || side > 2048)) {
					resolve({ status: 'resolution' });
					return;
				}
				resolve({ status: 'success', source });
			};
			image.src = source;
		};
		reader.readAsDataURL(file);
	});
};
