'use client';

import { useTranslations } from 'next-intl';

import { VacancyDetails } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { getFormatSalary } from '@/shared/libs';
import { AdditionalInfoDrawer } from '@/shared/ui/AdditionalInfoDrawer';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import { VacancyAdditionalInfo } from '../../VacancyAdditionalInfo';
import styles from './VacancyHeader.module.css';

interface VacancyHeaderProps {
	company: VacancyDetails['company'];
	title: VacancyDetails['title'];
	salary: VacancyDetails['salary'];
	applyVacancyUrl: VacancyDetails['applyVacancyUrl'];
	skills: VacancyDetails['skills'];
	aiProfile: VacancyDetails['aiProfile'];
}
export const VacancyHeader = ({
	company,
	title,
	salary,
	applyVacancyUrl,
	skills,
	aiProfile,
}: VacancyHeaderProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const newSalary = getFormatSalary(salary?.from, salary?.to, salary?.currency, t);

	return (
		<Flex justify="between" className={styles.content}>
			<Flex gap="16" align="start">
				<ImageWithWrapper
					src={company?.imageSrc}
					alt={company?.title}
					className={styles['company-logo']}
				/>
				<Flex gap="8" direction="column" className={styles['vacancy-info']}>
					<Text variant="body6" color="black-900" className={styles.title}>
						{title}
					</Text>
					<Flex gap="8" align="center">
						<Icon
							icon="tickWithBackground"
							color="purple-700"
							size={16}
							className={styles['tick-icon']}
						/>
						<Text variant="body5-accent" color="black-900" className={styles['company-title']}>
							{company?.title}
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex gap="20" direction="column" align="end">
				{newSalary && (
					<Flex gap="4" direction="column" align="end">
						<Text variant="body6" color="black-900" className={styles.salary}>
							{newSalary}
						</Text>
						<Text variant="body2-accent" color="black-400" className={styles['salary-caption']}>
							{t(Vacancies.SALARY_CAPTION)}
						</Text>
					</Flex>
				)}
				<AdditionalInfoDrawer>
					<VacancyAdditionalInfo skills={skills} aiProfile={aiProfile} />
				</AdditionalInfoDrawer>
				<a
					href={applyVacancyUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={styles['respond-link']}
				>
					<Button size="large" className={styles['respond-btn']}>
						<span className={styles['respond-text']}>{t(Vacancies.BUTTONS_RESPOND)}</span>
						<Icon icon="arrowRightUp" size={24} className={styles['respond-icon']} />
					</Button>
				</a>
			</Flex>
		</Flex>
	);
};
