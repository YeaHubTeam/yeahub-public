'use client';

import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { getQuestionsList } from '@/entities/question';
import type { PersonalNavigationPageReader, QuestionPersonalStateResult, QuestionListItem } from '@/entities/question';
import { useRouter } from '@/shared/config';
import { QUESTIONS_PER_PAGE } from '@/shared/libs';

type ListPage = { data: Pick<QuestionListItem, 'id' | 'slug'>[]; total: number; limit: number };
type Neighbor = { question: Pick<QuestionListItem, 'id' | 'slug'>; page: number };
type PersonalOwner = Extract<QuestionPersonalStateResult, { status: 'success' }>;
type Navigation = { scope: string; owner?: PersonalOwner; previous?: Neighbor; next?: Neighbor };

// One neighbor algorithm; only the page reader differs for personal list modes.
export const useQuestionNavigation = ({ questionId, specialization, readPersonalPage, personalState }: {
	questionId?: number;
	readPersonalPage?: PersonalNavigationPageReader;
	personalState?: Extract<QuestionPersonalStateResult, { status: 'success' }>;
	specialization?: { id: number; slug: string };
}) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const query = searchParams?.toString() ?? '';
	const specializationId = specialization?.id;
	const specializationSlug = specialization?.slug;
	const selectedStatus = searchParams?.get('status') || 'all';
	const isPrivate = ['favorite', 'learned', 'not-learned'].includes(selectedStatus);
	// Includes membership/progress so a detail mutation invalidates old neighbors too.
	const privateOwner = isPrivate ? personalState : undefined;
	const ownerScope = isPrivate ? JSON.stringify(privateOwner ?? null) : 'public';
	const scope = `${questionId}:${specializationId}:${specializationSlug}:${query}:${ownerScope}`;
	const [navigation, setNavigation] = useState<Navigation | null>(null);

	useEffect(() => {
		let alive = true;
		const load = async () => {
			if (!questionId || !specializationId || !specializationSlug) return;
			const params = new URLSearchParams(query);
			const status = params.get('status') || 'all';
			if (status !== 'all' && !isPrivate) return;
			if (!isPrivate && (params.get('areFavorites') === 'true' || params.has('isLearned'))) return;
			if (isPrivate && (!readPersonalPage || !privateOwner || privateOwner.state.questionId !== questionId ||
				(status !== 'favorite' && privateOwner.hasPremiumAccess !== true))) return;
			const page = Number(params.get('page') ?? 1);
			if (!Number.isSafeInteger(page) || page <= 0) return;
			const order = params.get('order');
			const orderBy = params.get('orderBy');
			const filters = {
				limit: QUESTIONS_PER_PAGE,
				specializationId,
				title: params.get('title') ?? undefined,
				titleOrDescription: params.has('title') ? undefined : params.get('titleOrDescription') ?? undefined,
				skills: params.get('skills') ?? undefined,
				complexity: params.get('complexity') ?? undefined,
				rate: params.get('rate') ?? undefined,
				order: order === 'ASC' || order === 'DESC' ? order : undefined,
				orderBy: orderBy && ['title', 'complexity', 'rate'].includes(orderBy) ? orderBy : undefined,
				skillFilterMode: 'ANY' as const,
			};
			const read = async (pageNumber: number): Promise<ListPage> => {
				let result: ListPage;
				if (isPrivate) {
					if (!privateOwner || !readPersonalPage) throw new Error('Personal navigation unavailable');
					const response = await readPersonalPage({
						status: status as 'favorite' | 'learned' | 'not-learned',
						page: pageNumber, specializationId,
						title: filters.title, titleOrDescription: filters.titleOrDescription,
						skills: filters.skills, complexity: filters.complexity, rate: filters.rate,
						order: order === 'ASC' || order === 'DESC' ? order : undefined,
						orderBy: orderBy === 'title' || orderBy === 'complexity' || orderBy === 'rate' ? orderBy : undefined,
					});
					if (response.status !== 'success' || response.userId !== privateOwner.userId ||
						response.profileId !== privateOwner.profileId) throw new Error('Personal navigation scope changed');
					result = response.list;
				} else {
					result = await getQuestionsList({ ...filters, page: pageNumber });
				}
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
					scope, owner: privateOwner,
					previous: previous ? { question: previous, page: index > 0 ? page : page - 1 } : undefined,
					next: next ? { question: next, page: index < current.data.length - 1 ? page : page + 1 } : undefined,
				});
			} catch {
				if (alive) setNavigation({ scope, owner: privateOwner });
			}
		};
		void load();
		return () => { alive = false; };
	}, [query, questionId, specializationId, specializationSlug, scope, isPrivate, readPersonalPage, ownerScope, privateOwner]);

	const current = navigation?.scope === scope && (!isPrivate || navigation.owner === privateOwner) ? navigation : null;
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
