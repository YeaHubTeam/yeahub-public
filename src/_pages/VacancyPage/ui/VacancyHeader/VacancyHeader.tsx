'use client';

import { useTranslations } from 'next-intl';

import { Vacancy } from '@/entities/vacancy';
import { i18Namespace } from '@/shared/config';
import { getFormatSalary } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import styles from './VacancyHeader.module.css';

interface VacancyHeaderProps {
	company: Vacancy['company'];
	title: Vacancy['title'];
	salary: Vacancy['salary'];
}
export const VacancyHeader = ({ company, title, salary }: VacancyHeaderProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const newSalary = getFormatSalary(salary?.from, salary?.to, salary?.currency, t);

	return (
		<Card withOutsideShadow className={styles.content}>
			<Flex justify="between">
				<Flex gap="16" align="start">
					<ImageWithWrapper
						src={company?.imageSrc}
						alt={company?.title}
						className={styles['company-logo']}
					/>
					<Flex gap="8" direction="column" className={styles['vacancy-info']}>
						<Text isMainTitle variant="body6" color="black-900" className={styles.title}>
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
						<Text variant="body6" color="black-900" isNoWrap className={styles.salary}>
							{newSalary}
						</Text>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};
