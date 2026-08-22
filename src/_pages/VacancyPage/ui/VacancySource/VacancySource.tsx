'use client';

import Image, { StaticImageData } from 'next/image';

import { useTranslations } from 'next-intl';

import { Vacancy } from '@/entities/vacancy';
import Hh from '@/shared/assets/images/hh.png';
import { Vacancies, i18Namespace } from '@/shared/config';
import { useGetCurrentDay } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './VacancySource.module.css';

interface VacancySourceProps {
	source: Vacancy['source'];
	sourcePublishedAt: Vacancy['sourcePublishedAt'];
	workFormat: Vacancy['workFormat'];
	internship: Vacancy['internship'];
}

export const VacancySource = ({
	source,
	sourcePublishedAt,
	internship,
	workFormat,
}: VacancySourceProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const formattedDate = useGetCurrentDay(sourcePublishedAt);

	const sourceImg: Record<Vacancy['source'], StaticImageData | ''> = {
		hh: Hh,
		habr: '',
		anonymous: '',
		hr: '',
		telegram: '',
		company_site: '',
	};

	const infoItems = [
		{
			label: t(Vacancies.SOURCE_TITLE),
			value: `${source}.ru`,
			icon: <Image className={styles['source-logo']} src={sourceImg[source]} alt={source || ''} />,
		},
		{
			label: t(Vacancies.SOURCE_DATE_ADDED),
			value: formattedDate,
		},
		{
			label: t(Vacancies.SOURCE_FORMAT),
			value: workFormat?.length ? workFormat.join(', ') : '-',
			icon: <Icon size={20} icon="wifi" color="green-1000" />,
		},
		{
			label: t(Vacancies.SOURCE_INTERNSHIP_TITLE),
			value: internship ? t(Vacancies.SOURCE_INTERNSHIP_YES) : t(Vacancies.SOURCE_INTERNSHIP_NO),
			icon: <Icon size={20} icon="bagSimple" color="green-1000" />,
		},
	];

	return (
		<Card withOutsideShadow className={styles.container}>
			<Flex justify="between">
				{infoItems.map((item) => (
					<Flex gap="8" direction="column" key={item.label} className={styles.item}>
						<Text variant="body3-accent" color="black-400">
							{item.label}
						</Text>
						<Flex gap="8" align="center">
							{item.icon}
							<Text variant="body2-accent" color="black-900">
								{item.value}
							</Text>
						</Flex>
					</Flex>
				))}
			</Flex>
		</Card>
	);
};
