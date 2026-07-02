import { useTranslations } from 'next-intl';

import { VacancyDetails } from '@/entities/vacancy';
import { i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { tagList } from '../model/constants/tagsConstants';
import styles from './VacancyTags.module.css';

interface VacancyTagsProps {
	workFormat: VacancyDetails['workFormat'];
	grade: VacancyDetails['grade'];
	employmentForm: VacancyDetails['employmentForm'];
	industry: VacancyDetails['industry'];
	companyType: VacancyDetails['companyType'];
}
export const VacancyTags = ({
	workFormat,
	grade,
	employmentForm,
	industry,
	companyType,
}: VacancyTagsProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const tagsValue = {
		workFormat: workFormat.length ? workFormat.join(', ') : '-',
		grade: grade ?? '-',
		employmentForm: employmentForm ?? '-',
		industry: industry ?? '-',
		companyType: companyType ?? '-',
	};

	return (
		<Flex componentType="ul" wrap="wrap" gap="15" align="start" className={styles['tag-list']}>
			{tagList.map(({ id, icon, category }) => (
				<Flex key={id} gap="8" componentType="li" align="start" className={styles['tag-item']}>
					<Icon size={20} icon={icon} color="green-1000" />
					<Flex gap="4" direction="column">
						<Text variant="body3-strong" color="black-900" isNoWrap>
							{tagsValue[id]}
						</Text>
						<Text variant="body3-accent" color="black-400" isNoWrap>
							{t(category)}
						</Text>
					</Flex>
				</Flex>
			))}
		</Flex>
	);
};
