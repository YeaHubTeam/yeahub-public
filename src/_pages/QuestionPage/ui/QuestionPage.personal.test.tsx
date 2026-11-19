import type { ReactNode } from 'react';

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Question } from '@/entities/question';

import { QuestionPage } from './QuestionPage';

jest.mock('@/entities/guru', () => ({
	getGuruWithMatchingSpecialization: () => null,
	getNewGuruWithMatchingSpecialization: () => null,
}));
jest.mock('@/entities/question', () => ({
	QuestionAdditionalInfo: () => <aside>Public metadata</aside>,
}));
jest.mock('@/shared/ui/BackButton', () => ({
	BackButton: () => <button>Назад</button>,
}));
jest.mock('@/widgets/Media', () => ({ SidebarBanner: () => null }));
jest.mock('@/widgets/question/QuestionHeader', () => ({
	QuestionHeader: ({
		question,
		personalProgress,
	}: {
		question: Question;
		personalProgress?: ReactNode;
	}) => (
		<header>
			<h1>{question.title}</h1>
			<div data-testid="drawer-slot">{personalProgress}</div>
		</header>
	),
}));
jest.mock('@/widgets/question/QuestionBody', () => ({
	QuestionBody: ({ shortAnswer, longAnswer }: { shortAnswer: string; longAnswer: string }) => (
		<article>
			{shortAnswer} {longAnswer}
		</article>
	),
}));
jest.mock('@/widgets/question/QuestionPersonalState', () => ({
	QuestionFavoriteActions: () => <section data-testid="favorite-actions" />,
	QuestionPersonalStateProvider: ({
		questionId,
		children,
	}: {
		questionId: number;
		children: ReactNode;
	}) => (
		<div data-testid="personal-scope" data-question-id={questionId}>
			{children}
		</div>
	),
	QuestionProgress: ({ inDrawer }: { inDrawer?: boolean }) => (
		<div data-testid={inDrawer ? 'drawer-progress' : 'desktop-progress'} />
	),
}));
it('keeps public content and mounts only a question-id personalization leaf', () => {
	const question = {
		id: 7,
		title: 'Public title',
		shortAnswer: 'Short answer',
		longAnswer: 'Long answer',
		keywords: [],
		questionSkills: [],
		questionSpecializations: [],
	} as unknown as Question;
	render(<QuestionPage question={question} favoriteAction={jest.fn()} />);
	expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Public title');
	expect(screen.getByRole('article')).toHaveTextContent('Short answer Long answer');
	expect(screen.getByTestId('personal-scope')).toHaveAttribute('data-question-id', '7');
	expect(screen.getByTestId('drawer-slot')).toContainElement(screen.getByTestId('drawer-progress'));
	expect(screen.getByTestId('desktop-progress').nextElementSibling).toHaveTextContent(
		'Public metadata',
	);
	expect(screen.getByRole('article').previousElementSibling).toBe(
		screen.getByTestId('favorite-actions'),
	);
	expect(screen.getByTestId('favorite-actions').previousElementSibling?.tagName).toBe('HEADER');
});
it('keeps force-static route, public loaders, metadata and JSON-LD without session access', () => {
	const route = readFileSync(
		join(process.cwd(), 'src/app/[locale]/(public)/questions/[specialization]/[slug]/page.tsx'),
		'utf8',
	);
	expect(route).toContain("export const dynamic = 'force-static'");
	expect(route).toContain('export async function generateMetadata');
	expect(route).toContain('export const generateStaticParams');
	expect(route).toContain('application/ld+json');
	expect(route).toContain('getQuestionBySlug(slug)');
	expect(route).not.toMatch(/currentBackendSession|next\/headers|personal-state|no-store/);
});
