'use client';

import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { getQuestionsList } from '@/entities/question';
import type { GetQuestionsListResponse, Question } from '@/entities/question';
import { useRouter } from '@/shared/config';
import { QUESTIONS_PER_PAGE } from '@/shared/libs';

type Neighbor = { question: Question; page: number };
type Navigation = { scope: string; previous?: Neighbor; next?: Neighbor };

// The same public list and pagination as QuestionsPage; no private identity from query params.
export const useQuestionNavigation = ({ questionId, specialization }: {
	questionId?: number;
	specialization?: { id: number; slug: string };
}) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const query = searchParams?.toString() ?? '';
	const specializationId = specialization?.id;
	const specializationSlug = specialization?.slug;
	const scope = `${questionId}:${specializationId}:${specializationSlug}:${query}`;
	const [navigation, setNavigation] = useState<Navigation | null>(null);

	useEffect(() => {
		let alive = true;
		const load = async () => {
			if (!questionId || !specializationId || !specializationSlug) return;
			const params = new URLSearchParams(query);
			const status = params.get('status') || 'all';
			// Personal list endpoints are not implemented yet. Never substitute a public list.
			if (status !== 'all' || params.get('areFavorites') === 'true' || params.has('isLearned')) return;
			const page = Number(params.get('page') ?? 1);
			if (!Number.isSafeInteger(page) || page <= 0) return;
			const order = params.get('order');
			const orderBy = params.get('orderBy');
			const filters = {
				limit: QUESTIONS_PER_PAGE,
				specializationId,
				titleOrDescription: params.get('titleOrDescription') ?? params.get('title') ?? undefined,
				skills: params.get('skills') ?? undefined,
				complexity: params.get('complexity') ?? undefined,
				rate: params.get('rate') ?? undefined,
				order: order === 'ASC' || order === 'DESC' ? order : undefined,
				orderBy: orderBy && ['title', 'complexity', 'rate'].includes(orderBy) ? orderBy : undefined,
				skillFilterMode: 'ANY' as const,
			};
			const read = async (pageNumber: number): Promise<GetQuestionsListResponse> => {
				const result = await getQuestionsList({ ...filters, page: pageNumber });
				if (!result || !Array.isArray(result.data) || !Number.isSafeInteger(result.total) || result.total < 0 ||
					!Number.isSafeInteger(result.limit) || result.limit <= 0 || result.limit !== QUESTIONS_PER_PAGE ||
					!result.data.every(item => Number.isSafeInteger(item.id) && item.id > 0 && typeof item.slug === 'string' && item.slug.length > 0)) throw new Error('Invalid question navigation list');
				return result;
			};
			try {
				const current = await read(page);
				if (!alive) return;
				const index = current.data.findIndex(item => item.id === questionId);
				// A removed/filtered-out question must not silently navigate in another context.
				if (index < 0) return;
				const lastPage = Math.ceil(current.total / current.limit);
				if (page > lastPage) return;
				const [previousPage, nextPage] = await Promise.all([
					index === 0 && page > 1 ? read(page - 1) : undefined,
					index === current.data.length - 1 && page < lastPage ? read(page + 1) : undefined,
				]);
				if (!alive) return;
				const previous = current.data[index - 1] ?? previousPage?.data.at(-1);
				const next = current.data[index + 1] ?? nextPage?.data[0];
				setNavigation({
					scope,
					previous: previous ? { question: previous, page: index > 0 ? page : page - 1 } : undefined,
					next: next ? { question: next, page: index < current.data.length - 1 ? page : page + 1 } : undefined,
				});
			} catch {
				if (alive) setNavigation({ scope });
			}
		};
		void load();
		return () => { alive = false; };
	}, [query, questionId, specializationId, specializationSlug, scope]);

	const current = navigation?.scope === scope ? navigation : null;
	const move = (neighbor?: Neighbor) => {
		if (!neighbor || !specializationSlug) return;
		const params = new URLSearchParams(query);
		params.set('page', String(neighbor.page));
		router.push(`/questions/${encodeURIComponent(specializationSlug)}/${encodeURIComponent(neighbor.question.slug)}?${params.toString()}`);
	};
	return {
		onMovePrev: current?.previous ? () => move(current.previous) : undefined,
		onMoveNext: current?.next ? () => move(current.next) : undefined,
		isDisabled: current === null,
	};
};
