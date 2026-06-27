import { useTranslations } from 'next-intl';

import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import type { VacancyPreparation, VacancySalary } from '../../model/types/vacancy';
import styles from './VacancyCardDetails.module.css';

interface VacancyCardDetailsProps {
	preparation: VacancyPreparation;
	salary: VacancySalary;
}

export const VacancyCardDetails = ({ preparation, salary }: VacancyCardDetailsProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const { collectionsCount, questionsCount, tasksCount } = preparation;
	const { from: salaryFrom, to: salaryTo, currency } = salary;

	const formatSalary = (from: number | null, to: number | null, currency: string | null) => {
		if (!from && !to) return null;

		const currencyPart = currency ?? '';

		if (from === to) return `${from} ${currencyPart}`.trim();

		const fromPart = from ? `от ${from}` : '';
		const toPart = to ? `до ${to}` : '';

		return `${fromPart} ${toPart} ${currencyPart}`.trim();
	};

	const formattedSalary = formatSalary(salaryFrom, salaryTo, currency);

	const hasPreparation = collectionsCount === 0 || questionsCount === 0 || tasksCount === 0;

	const getVacancyPreparationData = (
		questionsCount: number,
		tasksCount: number,
		collectionsCount: number,
	) => [
		{ count: questionsCount, labelKey: Vacancies.MAIN_PAGE_COUNT_QUESTIONS, suffix: '' },
		{ count: tasksCount, labelKey: Vacancies.MAIN_PAGE_COUNT_TASKS, suffix: ' для подготовки' },
		{ count: collectionsCount, labelKey: Vacancies.MAIN_PAGE_COUNT_COLLECTIONS, suffix: '' },
	];

	return (
		<>
			{hasPreparation || formattedSalary ? (
				<Flex justify="between" align="center">
					<Flex>
						{hasPreparation && (
							<Card withOutsideShadow className={styles[`preparation-block`]}>
								<Flex gap="10" align="center">
									<Icon icon="refferals" size={14} />
									{getVacancyPreparationData(questionsCount, tasksCount, collectionsCount)
										.filter(({ count }) => count === 0)
										.map(({ count, labelKey, suffix }) => (
											<Flex key={labelKey} gap="10" align="center" className={styles.preparation}>
												<Text variant="body1-accent" className={styles[`preparation-text`]}>
													{t(labelKey, { count })}
													{suffix}
												</Text>
											</Flex>
										))}
								</Flex>
							</Card>
						)}
					</Flex>

					<Flex>{formattedSalary && <Text variant="body6">{formattedSalary}</Text>}</Flex>
				</Flex>
			) : (
				<Flex></Flex>
			)}
		</>
	);
};
