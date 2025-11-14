'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { emptyStubTestIds } from '@/shared/ui/EmptyStub/constants';
import { Text } from '@/shared/ui/Text';

import styles from './EmptyStub.module.css';

export interface EmptyStubProps {
	text?: string | undefined;
}

export const EmptyStub = ({ text }: EmptyStubProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const t = useTranslations(i18Namespace.translation);

	const resetFilters = () => {
		const params = new URLSearchParams(searchParams?.toString() ?? '');
		params.delete('titleOrDescription');
		params.delete('skills');
		params.delete('complexity');
		params.delete('rate');
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<>
			<Text
				dataTestId={emptyStubTestIds.emptyStubText}
				variant={'body5-accent'}
				className={styles.text}
			>
				{t(Translation.STUB_FILTER_TITLE, { text: text ? `“${text}”` : '' })}
			</Text>
			<Button
				dataTestId={emptyStubTestIds.emptyStubButton}
				size="large"
				variant="outline"
				onClick={resetFilters}
				className={styles.button}
			>
				{t(Translation.RESET_FILTERS)}
			</Button>
		</>
	);
};
