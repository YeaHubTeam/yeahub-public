import { getOwnQuestionPersonalState } from '@/app/_bff/question/index.server';

export const dynamic = 'force-dynamic';

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ questionId: string }> },
) {
	const { questionId } = await params;
	// The only input is the public question ID; reject attempts to supply identity/query context.
	const result =
		/^\d+$/.test(questionId) && !new URL(request.url).search
			? await getOwnQuestionPersonalState(Number(questionId))
			: { status: 'invalid-input' as const };
	return Response.json(result, {
		status:
			result.status === 'invalid-input' ? 400 : result.status === 'unauthenticated' ? 401 : 200,
		headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', Pragma: 'no-cache' },
	});
}
