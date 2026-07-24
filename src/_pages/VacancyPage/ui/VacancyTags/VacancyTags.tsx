import { useTranslations } from 'next-intl';

import { Vacancy } from '@/entities/vacancy';
import { i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { tagList } from '../../model/constants/tagsConstants';
import styles from './VacancyTags.module.css';

interface VacancyTagsProps {
	area: Vacancy['area'];
	grade: Vacancy['grade'];
	employmentForm: Vacancy['employmentForm'];
	industry: Vacancy['industry'];
	companyType: Vacancy['companyType'];
}
export const VacancyTags = ({
	area,
	grade,
	employmentForm,
	industry,
	companyType,
}: VacancyTagsProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const tagsValue = {
		area: area ?? '-',
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
