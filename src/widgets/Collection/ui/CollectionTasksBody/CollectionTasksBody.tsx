import { useTranslations } from 'next-intl';

import { Collection, CollectionWarningInfo } from '@/entities/collection';
import { ProgrammingLanguageList } from '@/entities/programmingLanguage';
import { Task, TaskCard, TaskCompanyList } from '@/entities/tasks';
import { Tasks, i18Namespace } from '@/shared/config';
import { ROUTES } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { SimpleStub } from '@/shared/ui/SimpleStub';
import { Text } from '@/shared/ui/Text';

import styles from './CollectionTasksBody.module.css';

interface CollectionTasksBodyProps extends Pick<Collection, 'isFree'> {
	tasks: Task[];
}

export const CollectionTasksBody = ({ tasks, isFree }: CollectionTasksBodyProps) => {
	const t = useTranslations(i18Namespace.tasks);

	const link = ROUTES.settings.page + '#select-tariff';

	if (!isFree)
		return (
			<Card
				className={styles.wrapper}
				titleComponent={
					<Text variant="head2" className={styles['title-preview']}>
						{t(Tasks.TITLE_SHORT)}
					</Text>
				}
				actionRoute={link}
				actionTitle={t(Tasks.COMMUNITY_JOIN)}
				withOutsideShadow
			>
				<SimpleStub variant="no-access" text={t(Tasks.PREVIEW_LOCKED_COLLECTION)} />
			</Card>
		);

	return (
		<Card
			className={styles.wrapper}
			titleComponent={
				<Text variant="head2" className={styles['title-preview']}>
					{t(Tasks.TITLE_SHORT)}
				</Text>
			}
			headerAction={<CollectionWarningInfo />}
			withOutsideShadow
		>
			{tasks.length ? (
				<Flex direction="column" gap="16">
					{tasks.map((task) => (
						<TaskCard
							key={task.id}
							id={task.id}
							slug={task.slug}
							name={task.name}
							difficulty={task.difficulty}
							mainCategory={task.mainCategory}
							canSolve={task.canSolve}
							languagesSlot={
								<ProgrammingLanguageList supportedLanguages={task.supportedLanguages} />
							}
							companiesSlot={<TaskCompanyList companies={task.companies} />}
						/>
					))}
				</Flex>
			) : (
				<SimpleStub variant="empty" text={t(Tasks.STUB_EMPTY_TASKS_PUBLIC_SUBTITLE)} />
			)}
		</Card>
	);
};
