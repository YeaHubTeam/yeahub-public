/** @jest-environment node */
import { getOwnQuestionPersonalState } from '@/app/_bff/question/index.server';

import { GET } from './route';

jest.mock('@/app/_bff/question/index.server', () => ({ getOwnQuestionPersonalState: jest.fn() }));
const read = jest.mocked(getOwnQuestionPersonalState);
beforeEach(() => {
	jest.resetAllMocks();
});
it.each(['success', 'unauthenticated', 'no-active-profile', 'error'] as const)(
	'sets private/no-store on %s',
	async (status) => {
		read.mockResolvedValue({ status } as Awaited<ReturnType<typeof getOwnQuestionPersonalState>>);
		const response = await GET(new Request('https://app.example/api/questions/7/personal-state'), {
			params: Promise.resolve({ questionId: '7' }),
		});
		expect(response.headers.get('cache-control')).toBe('private, no-store');
		expect(response.headers.get('vary')).toBe('Cookie');
		expect(read).toHaveBeenCalledWith(7);
	},
);
it.each(['?profileId=foreign', '?userId=other'])(
	'rejects client identity %s without BFF access',
	async (query) => {
		const response = await GET(
			new Request(`https://app.example/api/questions/7/personal-state${query}`),
			{ params: Promise.resolve({ questionId: '7' }) },
		);
		expect(response.status).toBe(400);
		expect(read).not.toHaveBeenCalled();
	},
);
