'use client';

import { useTranslations } from 'next-intl';

import { CompaniesSelect } from '@/entities/company/@x/task';
import { Tasks, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

interface CompaniesFilterSectionProps {
	selectedCompany?: string;
	onChangeCompany: (value?: string) => void;
}

export const CompaniesFilterSection = ({
	selectedCompany,
	onChangeCompany,
}: CompaniesFilterSectionProps) => {
	const t = useTranslations(i18Namespace.tasks);
	const handleChangeCompany = (value?: string | string[]) => {
		if (Array.isArray(value)) return;

		onChangeCompany(value);
	};

	return (
		<Flex direction="column" align="start" gap="8">
			<Text variant="body2" color="black-700">
				{t(Tasks.COMPANIES_TITLE)}
			</Text>
			<CompaniesSelect value={selectedCompany} onChange={handleChangeCompany} />
		</Flex>
	);
};
