import { Blob, File } from 'node:buffer';
import { TextDecoder, TextEncoder } from 'node:util';
import { FormData, Headers, Request, Response, fetch } from 'undici';
import { ReadableStream } from 'web-streams-polyfill';

Object.defineProperties(globalThis, {
	ReadableStream: { value: ReadableStream },
	TextDecoder: { value: TextDecoder },
	TextEncoder: { value: TextEncoder },
});

Object.defineProperties(globalThis, {
	fetch: { value: fetch, writable: true },
	Blob: { value: Blob },
	File: { value: File },
	Headers: { value: Headers },
	FormData: { value: FormData },
	Request: { value: Request },
	Response: { value: Response },
});
