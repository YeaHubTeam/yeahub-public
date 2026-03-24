'use client';

import { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';
import { Companies } from '@/shared/config/i18n/i18nTranslations';
import { BaseFilterItem, BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import { MAX_SHOW_LIMIT_COMPANIES } from '../../model/constants/company';
import { useCompanies } from '../../model/hooks/useCompanies';
import { GetCompaniesResponse } from '../../model/types/company';

interface CompaniesListFieldProps {
	selectedCompany?: string;
	onChangeCompany: (company: string | undefined) => void;
	initialData?: GetCompaniesResponse | null;
}

export const CompaniesListField = ({
	selectedCompany,
	onChangeCompany,
	initialData,
}: CompaniesListFieldProps) => {
	const t = useTranslations(i18Namespace.company);
	const tCommon = useTranslations(i18Namespace.translation);

	const [showAll, setShowAll] = useState(false);
	const [limit, setLimit] = useState(MAX_SHOW_LIMIT_COMPANIES);

	const { data: companies } = useCompanies({ limit }, initialData);

	useEffect(() => {
		if (showAll) {
			const total = companies?.total ?? MAX_SHOW_LIMIT_COMPANIES;

			setLimit(total);
		} else {
			setLimit(MAX_SHOW_LIMIT_COMPANIES);
		}
	}, [showAll, companies?.total]);

	const onToggleShowAll = () => {
		setShowAll(!showAll);
	};

	const onChooseCompany = (id: string) => {
		onChangeCompany(id);
	};

	const companiesItems: BaseFilterItem<string>[] | undefined = useMemo(
		() =>
			companies?.data.map(({ id, title }) => ({
				id,
				title,
				active: selectedCompany === id,
			})),
		[companies, selectedCompany],
	);

	if (!companiesItems) return null;

	return (
		<Flex direction="column" align="start" gap="8">
			<BaseFilterSection
				data={companiesItems}
				title={t(Companies.TITLE)}
				onClick={onChooseCompany}
			/>
			<Button variant="link" onClick={onToggleShowAll}>
				{!showAll ? tCommon(Translation.SHOW_ALL) : tCommon(Translation.HIDE)}
			</Button>
		</Flex>
	);
};
