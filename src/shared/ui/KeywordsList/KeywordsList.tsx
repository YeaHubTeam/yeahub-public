'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

export const KeywordsListTestIds = {
	wrapper: 'KeywordsListWrapper',
	text: 'KeywordsListText',
};

interface KeywordsListProps {
	keywords: string[];
	path?: string;
}

export const KeywordsList = ({ keywords, path = '/' }: KeywordsListProps) => {
	const searchParams = useSearchParams();
	const locale = useLocale();

	let href = path;

	if (path === '/') {
		const specializationSlug = searchParams?.get('specialization') || DEFAULT_SPECIALIZATION_SLUG;
		href = `/${locale}/questions/${specializationSlug}?page=1&status=all&titleOrDescription=`;
	} else {
		href = `${path}?page=1&status=all&titleOrDescription=`;
	}
	return (
		<Flex wrap="wrap" gap="14" dataTestId={KeywordsListTestIds.wrapper}>
			{keywords.map((keyword) => {
				return (
					<Link key={keyword} href={href + encodeURIComponent(keyword)}>
						<Text
							variant="body3"
							color="purple-700"
							dataTestId={KeywordsListTestIds.text}
						>{`#${keyword}`}</Text>
					</Link>
				);
			})}
		</Flex>
	);
};
