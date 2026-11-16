/** @jest-environment node */
import { deflateSync } from 'node:zlib';

import { mutateOwnAvatar } from '@/app/_bff/profile/index.server';

import { changeOwnAvatar } from './actions';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/app/_bff/profile/index.server', () => ({ mutateOwnAvatar: jest.fn() }));
const mutation = jest.mocked(mutateOwnAvatar);
const MAX = 5 * 1024 * 1024;
const crc = (bytes: Buffer) => {
	let value = 0xffffffff;
	for (const byte of bytes) {
		value ^= byte;
		for (let i = 0; i < 8; i++) value = (value >>> 1) ^ (0xedb88320 & -(value & 1));
	}
	return (value ^ 0xffffffff) >>> 0;
};
const chunk = (name: string, data: Buffer) => {
	const type = Buffer.from(name);
	const size = Buffer.alloc(4);
	size.writeUInt32BE(data.length);
	const checksum = Buffer.alloc(4);
	checksum.writeUInt32BE(crc(Buffer.concat([type, data])));
	return Buffer.concat([size, type, data, checksum]);
};
const png = (width = 128, height = width, padTo = 0) => {
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width);
	header.writeUInt32BE(height, 4);
	header[8] = 8;
	header[9] = 6;
	const start = Buffer.concat([
		Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
		chunk('IHDR', header),
		chunk('IDAT', deflateSync(Buffer.alloc((width * 4 + 1) * height))),
	]);
	const end = chunk('IEND', Buffer.alloc(0));
	const padding =
		padTo > start.length + end.length + 12
			? chunk(
					'tEXt',
					Buffer.concat([
						Buffer.from('comment\0'),
						Buffer.alloc(padTo - start.length - end.length - 20, 120),
					]),
				)
			: Buffer.alloc(0);
	return Buffer.concat([start, padding, end]);
};
beforeEach(() => {
	mutation.mockReset();
	mutation.mockResolvedValue({ status: 'success', avatarUrl: 'https://images.example/avatar.png' });
});

it.each([0, 1024 * 1024 + 1, MAX])(
	'accepts a decoded PNG size target %s, including over 1 MiB',
	async (size) => {
		const bytes = png(128, 128, size);
		if (size) expect(bytes.length).toBe(size);
		const input = { operation: 'set', avatarImage: bytes.toString('base64') };
		expect(Buffer.byteLength(JSON.stringify([input]))).toBeLessThan(8 * 1024 * 1024);
		expect(await changeOwnAvatar(input)).toEqual({
			status: 'success',
			avatarUrl: 'https://images.example/avatar.png',
		});
		expect(mutation).toHaveBeenCalledWith(input);
	},
);
it('rejects a decoded PNG greater than 5 MiB', async () => {
	expect(
		await changeOwnAvatar({
			operation: 'set',
			avatarImage: png(128, 128, MAX + 1).toString('base64'),
		}),
	).toEqual({ status: 'validation-error' });
	expect(mutation).not.toHaveBeenCalled();
});
it.each([
	[127, 127],
	[2049, 2049],
	[128, 129],
])('rejects dimensions %s x %s', async (width, height) => {
	expect(
		await changeOwnAvatar({ operation: 'set', avatarImage: png(width, height).toString('base64') }),
	).toEqual({ status: 'validation-error' });
	expect(mutation).not.toHaveBeenCalled();
});
it.each([128, 2048])('accepts the dimension boundary %s', async (side) => {
	expect(
		(await changeOwnAvatar({ operation: 'set', avatarImage: png(side).toString('base64') })).status,
	).toBe('success');
});
it.each([
	'',
	'not-base64!',
	'data:image/png;base64,aGVsbG8=',
	Buffer.from('not an image').toString('base64'),
])('rejects invalid encoding or content %#', async (avatarImage) => {
	expect(await changeOwnAvatar({ operation: 'set', avatarImage })).toEqual({
		status: 'validation-error',
	});
	expect(mutation).not.toHaveBeenCalled();
});
it('rejects a bad PNG checksum and truncated content', async () => {
	const image = png();
	image[35] ^= 1;
	for (const bytes of [image, png().subarray(0, -10)]) {
		expect(
			await changeOwnAvatar({ operation: 'set', avatarImage: bytes.toString('base64') }),
		).toEqual({ status: 'validation-error' });
	}
	expect(mutation).not.toHaveBeenCalled();
});
it('does not accept a signature and IHDR without decodable image data', async () => {
	const bytes = png();
	const body = Buffer.from(bytes);
	body.fill(0, 41, body.length - 16);
	expect(await changeOwnAvatar({ operation: 'set', avatarImage: body.toString('base64') })).toEqual(
		{ status: 'validation-error' },
	);
	expect(mutation).not.toHaveBeenCalled();
});
it.each([
	null,
	[],
	{ operation: 'delete', userId: 'other' },
	{ operation: 'set', avatarImage: 42 },
	{ operation: 'other' },
])('rejects invalid payload %#', async (input) => {
	expect(await changeOwnAvatar(input)).toEqual({ status: 'validation-error' });
	expect(mutation).not.toHaveBeenCalled();
});
it('deletes without requiring image bytes', async () => {
	await changeOwnAvatar({ operation: 'delete' });
	expect(mutation).toHaveBeenCalledWith({ operation: 'delete' });
});
it.each(['error', 'refresh-required', 'unauthenticated'] as const)(
	'preserves safe status %s without retries',
	async (status) => {
		mutation.mockResolvedValue({ status });
		expect(await changeOwnAvatar({ operation: 'delete' })).toEqual({ status });
		expect(mutation).toHaveBeenCalledTimes(1);
	},
);
it('sanitizes unexpected failures', async () => {
	mutation.mockRejectedValue(new Error('private token or image data'));
	expect(await changeOwnAvatar({ operation: 'delete' })).toEqual({ status: 'error' });
});

it('rejects invalid compressed pixels even with valid PNG checksums', async () => {
	const bytes = Buffer.concat([
		png().subarray(0, 33),
		chunk('IDAT', Buffer.from('not-zlib')),
		chunk('IEND', Buffer.alloc(0)),
	]);
	expect(
		await changeOwnAvatar({ operation: 'set', avatarImage: bytes.toString('base64') }),
	).toEqual({ status: 'validation-error' });
	expect(mutation).not.toHaveBeenCalled();
});
