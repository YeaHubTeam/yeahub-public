import { getTranslations } from 'next-intl/server';

import { getHhTopBySpec } from '@/entities/hh';
import { DEFAULT_SPECIALIZATION_ID } from '@/entities/specialization';
import { HhAnalyticsFiltersWrapper } from '@/features/hhAnalyticsFilters';
import { Analytics, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';
import { HhAnalyticsTableWrapper } from '@/widgets/HhAnalyticsTable';

const PAGE_LIMIT = 10;

interface HhAnalyticsPageProps {
	searchParams?: {
		page?: string;
		mode?: 'skills' | 'keywords';
		specialization?: string;
	};
	params: {
		locale: string;
	};
}

interface HhItem {
	title: string;
	count: number;
}

export const HhAnalyticsPage = async ({ searchParams, params }: HhAnalyticsPageProps) => {
	const t = await getTranslations({
		locale: params.locale,
		namespace: i18Namespace.analytics,
	});

	const page = Number(searchParams?.page) || 1;
	const mode = (searchParams?.mode as 'skills' | 'keywords') || 'skills';
	const specializationId = Number(searchParams?.specialization) || DEFAULT_SPECIALIZATION_ID;

	try {
		const data = await getHhTopBySpec(specializationId);

		const activeList = mode === 'skills' ? data?.skills || [] : data?.keywords || [];

		const start = (page - 1) * PAGE_LIMIT;
		const end = start + PAGE_LIMIT;

		const rows = activeList.slice(start, end).map((item: HhItem, idx: number) => {
			const absolutelyIndex = idx + start;
			return {
				id: item.title,
				index: absolutelyIndex + 1,
				count: item.count,
				title: item.title,
				isTop20: absolutelyIndex < 20,
			};
		});

		const total = activeList.length;

		return (
			<Card>
				<Flex direction="column" gap="24">
					<Text variant="body6">
						{mode === 'skills'
							? t(Analytics.HH_ANALYTICS_TITLE_SKILLS)
							: t(Analytics.HH_ANALYTICS_TITLE_KEYWORDS)}
					</Text>

					<HhAnalyticsFiltersWrapper
						initialSpecializationId={specializationId}
						initialMode={mode}
					/>

					<HhAnalyticsTableWrapper
						initialRows={rows}
						initialMode={mode}
						initialTotal={total}
						initialPage={page}
						pageLimit={PAGE_LIMIT}
					/>
				</Flex>
			</Card>
		);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
	}
};
