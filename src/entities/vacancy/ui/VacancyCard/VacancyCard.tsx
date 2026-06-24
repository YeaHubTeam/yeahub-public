import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import { MAX_SHOW_LIMIT_SKILLS } from '../../model/constants/vacancyConstants';
import { Vacancy } from '../../model/types/vacancy';
import styles from './VacancyCard.module.css';

interface VacancyCardProps {
	vacancy: Vacancy;
}

export const VacancyCard = ({ vacancy }: VacancyCardProps) => {
	const {
		company: { title: companyTitle, imageSrc },
		title,
		employmentForm,
		grade,
		workFormat,
		area,
		skills,
		preparation: { questionsCount, tasksCount },
		publishedAt,
		salary: { from: salaryFrom },
	} = vacancy;

	const formatVacancyDate = (dateStr: string): string => {
		const date = new Date(dateStr);
		const today = new Date();

		const isToday =
			date.getFullYear() === today.getFullYear() &&
			date.getMonth() === today.getMonth() &&
			date.getDate() === today.getDate();

		if (isToday) return 'Сегодня';

		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
		});
	};

	const publishedDate = formatVacancyDate(publishedAt);

	const visibleSkills = skills.slice(0, MAX_SHOW_LIMIT_SKILLS);
	const hiddenSkillsCount = skills.length - MAX_SHOW_LIMIT_SKILLS;

	const getSkillsLabel = (count: number) => {
		if (count % 10 === 1 && count % 100 !== 11) return 'навык';
		if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'навыка';
		return 'навыков';
	};
	const getQuestionsLabel = (count: number) => {
		if (count % 10 === 1 && count % 100 !== 11) return 'вопрос';
		if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'вопроса';
		return 'вопросов';
	};
	const getTasksLabel = (count: number) => {
		if (count % 10 === 1 && count % 100 !== 11) return 'задача';
		if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'задачи';
		return 'задач';
	};

	return (
		<Card withOutsideShadow className={styles.content}>
			<Flex gap="40" direction="column">
				<Flex gap="12" wrap="wrap" justify="between">
					<Flex gap="9" align="end" className={styles['company-info']}>
						<ImageWithWrapper
							src={imageSrc ?? undefined}
							alt={companyTitle}
							className={styles['image-wrapper']}
						/>
						<Text variant="body3-accent" className={styles['company-name']}>
							{companyTitle}
						</Text>
					</Flex>
					<Text variant="body5-accent" color="green-900" className={styles['published-date']}>
						{publishedDate}
					</Text>
					<Text variant="body6" className={styles.title}>
						{title}
					</Text>
				</Flex>
				<Flex gap="20" direction="column">
					<Flex gap="6" className={styles.conditions} align="center">
						<Text variant="body3-accent">{employmentForm}</Text>
						<span className={styles.dot} />
						<Text variant="body3-accent">{grade}</Text>
						<span className={styles.dot} />
						{workFormat.map((el) => (
							<Text variant="body3-accent" key={el}>
								{el}
							</Text>
						))}
						<span className={styles.dot} />
						<Text variant="body3-accent">{area}</Text>
					</Flex>
					<Flex gap="10" align="center">
						{visibleSkills.map(({ id, title }) => (
							<Card withOutsideShadow className={styles.skills} key={id}>
								<Text variant="body1-accent" className={styles.skill}>
									{title}
								</Text>
							</Card>
						))}
						{hiddenSkillsCount > 0 && (
							<Text variant="body3-accent" className={styles[`skill-count`]}>
								+{hiddenSkillsCount} {getSkillsLabel(hiddenSkillsCount)}
							</Text>
						)}
					</Flex>
					<Flex justify="between">
						<Flex gap="10" align="center">
							{questionsCount > 0 && (
								<Flex gap="10" align="center">
									<Icon icon="refferals" size={14} />
									<Text variant="body1-accent" className={styles.preparation}>
										{questionsCount} {getQuestionsLabel(questionsCount)}
									</Text>
								</Flex>
							)}
							{tasksCount > 0 && (
								<Flex gap="10" align="center">
									<span className={`${styles.dot} ${styles['black-dot']}`} />
									<Text variant="body1-accent" className={styles.preparation}>
										{tasksCount} {getTasksLabel(tasksCount)} для подготовки
									</Text>
								</Flex>
							)}
						</Flex>
						{salaryFrom && <Text variant="body6">от {salaryFrom} ₽</Text>}
					</Flex>
				</Flex>
			</Flex>
		</Card>
	);
};
