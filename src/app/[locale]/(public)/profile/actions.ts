'use server';

import { inflateSync } from 'node:zlib';
import 'server-only';

import { mutateOwnAvatar } from '@/auth';
import type { AvatarActionResult } from '@/features/profile/avatar';

const MAX_BYTES = 5 * 1024 * 1024;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const crc32 = (bytes: Buffer): number => {
	let crc = 0xffffffff;
	for (const byte of bytes) {
		crc ^= byte;
		for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
	}
	return (crc ^ 0xffffffff) >>> 0;
};

// Canvas crop produces non-interlaced, eight-bit RGB/RGBA PNG, never the original JPEG/AVIF.
// Validate all chunk boundaries/checksums and the bounded, decompressed scanlines.
const decodeCroppedPng = (bytes: Buffer): boolean => {
	if (!bytes.subarray(0, 8).equals(pngSignature)) return false;
	let offset = 8;
	let width = 0;
	let channels = 0;
	let sawHeader = false;
	let endedData = false;
	const data: Buffer[] = [];
	while (offset + 12 <= bytes.length) {
		const length = bytes.readUInt32BE(offset);
		const end = offset + 12 + length;
		if (end > bytes.length) return false;
		const type = bytes.toString('latin1', offset + 4, offset + 8);
		if (
			!/^[A-Za-z]{4}$/.test(type) ||
			crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)
		)
			return false;
		const chunk = bytes.subarray(offset + 8, end - 4);
		if (!sawHeader && type !== 'IHDR') return false;
		if (type === 'IHDR') {
			if (sawHeader || length !== 13) return false;
			width = chunk.readUInt32BE(0);
			const height = chunk.readUInt32BE(4);
			if (
				width !== height ||
				width < 128 ||
				width > 2048 ||
				chunk[8] !== 8 ||
				![2, 6].includes(chunk[9]) ||
				chunk[10] !== 0 ||
				chunk[11] !== 0 ||
				chunk[12] !== 0
			)
				return false;
			channels = chunk[9] === 6 ? 4 : 3;
			sawHeader = true;
		} else if (type === 'IDAT') {
			if (endedData) return false;
			data.push(chunk);
		} else {
			if (data.length) endedData = true;
			if (type === 'IEND') {
				if (length !== 0 || end !== bytes.length || data.length === 0) return false;
				const stride = width * channels + 1;
				const pixels = inflateSync(Buffer.concat(data), { maxOutputLength: stride * width });
				if (pixels.length !== stride * width) return false;
				for (let row = 0; row < width; row++) if (pixels[row * stride] > 4) return false;
				return true;
			}
			if (['acTL', 'fcTL', 'fdAT'].includes(type)) return false;
			if (type === 'PLTE') {
				if (data.length || length === 0 || length % 3 !== 0 || length > 768) return false;
			} else if (type[0] === type[0].toUpperCase()) return false;
		}
		offset = end;
	}
	return false;
};

const validCroppedPng = (bytes: Buffer): boolean => {
	try {
		return decodeCroppedPng(bytes);
	} catch {
		return false;
	}
};

export async function changeOwnAvatar(input: unknown): Promise<AvatarActionResult> {
	try {
		if (typeof input !== 'object' || input === null || Array.isArray(input))
			return { status: 'validation-error' };
		const value = input as Record<string, unknown>;
		if (value.operation === 'delete' && Object.keys(value).length === 1)
			return await mutateOwnAvatar({ operation: 'delete' });
		if (
			value.operation !== 'set' ||
			Object.keys(value).length !== 2 ||
			typeof value.avatarImage !== 'string'
		)
			return { status: 'validation-error' };
		const encoded = value.avatarImage;
		if (
			encoded.length === 0 ||
			encoded.length > 4 * Math.ceil(MAX_BYTES / 3) ||
			encoded.length % 4 !== 0 ||
			/[^A-Za-z0-9+/=]/.test(encoded)
		)
			return { status: 'validation-error' };
		const bytes = Buffer.from(encoded, 'base64');
		if (bytes.length > MAX_BYTES || bytes.toString('base64') !== encoded || !validCroppedPng(bytes))
			return { status: 'validation-error' };
		return await mutateOwnAvatar({ operation: 'set', avatarImage: encoded });
	} catch {
		return { status: 'error' };
	}
}
