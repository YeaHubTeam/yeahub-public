import { readAvatarFile } from './readAvatarFile';

let width = 128;
let height = 128;
beforeEach(() => {
	width = 128;
	height = 128;
	jest.spyOn(window, 'Image').mockImplementation(() => {
		const image = document.createElement('img');
		Object.defineProperty(image, 'naturalWidth', { get: () => width });
		Object.defineProperty(image, 'naturalHeight', { get: () => height });
		Object.defineProperty(image, 'src', {
			set: () => queueMicrotask(() => image.dispatchEvent(new Event('load'))),
		});
		return image;
	});
});
afterEach(() => jest.restoreAllMocks());
it.each([100, 1024 * 1024 + 1, 5 * 1024 * 1024])('accepts client file bytes %s', async (size) => {
	const result = await readAvatarFile(
		new File([new Uint8Array(size)], 'image.png', { type: 'image/png' }),
	);
	expect(result.status).toBe('success');
});
it('rejects files over 5 MiB', async () => {
	expect(
		await readAvatarFile(
			new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'image.png', { type: 'image/png' }),
		),
	).toEqual({ status: 'size' });
});
it('rejects a MIME type outside the allowed formats', async () => {
	expect(await readAvatarFile(new File(['image'], 'image.svg', { type: 'image/svg+xml' }))).toEqual(
		{ status: 'format' },
	);
});
it.each([
	[127, 128],
	[128, 2049],
	[2048, 2048],
])('checks both source dimensions %s x %s', async (w, h) => {
	width = w;
	height = h;
	const result = await readAvatarFile(new File(['image'], 'image.jpg', { type: 'image/jpeg' }));
	expect(result.status).toBe(w >= 128 && h <= 2048 ? 'success' : 'resolution');
});
