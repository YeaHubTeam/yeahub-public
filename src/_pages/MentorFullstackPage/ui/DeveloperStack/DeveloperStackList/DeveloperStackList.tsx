import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { DeveloperStackCard } from '../DeveloperStackCard/DeveloperStackCard';
import styles from './DeveloperStackList.module.css';

export const DeveloperStackList = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	const cards = [
		{
			id: 'frontend',
			title: t(MentorFullstack.DEVELOPER_STACK_FRONTEND_TITLE),
			chips: [
				t(MentorFullstack.DEVELOPER_STACK_FRONTEND_HTML),
				t(MentorFullstack.DEVELOPER_STACK_FRONTEND_JAVASCRIPT),
				t(MentorFullstack.DEVELOPER_STACK_FRONTEND_TYPESCRIPT),
				t(MentorFullstack.DEVELOPER_STACK_FRONTEND_REACT),
				t(MentorFullstack.DEVELOPER_STACK_FRONTEND_REDUX),
				t(MentorFullstack.DEVELOPER_STACK_FRONTEND_FSD),
				t(MentorFullstack.DEVELOPER_STACK_FRONTEND_NEXT),
			],
		},
		{
			id: 'backend',
			title: t(MentorFullstack.DEVELOPER_STACK_BACKEND_TITLE),
			chips: [
				t(MentorFullstack.DEVELOPER_STACK_BACKEND_NODE),
				t(MentorFullstack.DEVELOPER_STACK_BACKEND_EXPRESS),
				t(MentorFullstack.DEVELOPER_STACK_BACKEND_NEST),
				t(MentorFullstack.DEVELOPER_STACK_BACKEND_POSTGRES),
				t(MentorFullstack.DEVELOPER_STACK_BACKEND_REDIS),
				t(MentorFullstack.DEVELOPER_STACK_BACKEND_KAFKA),
				t(MentorFullstack.DEVELOPER_STACK_BACKEND_MICROSERVICES),
				t(MentorFullstack.DEVELOPER_STACK_BACKEND_JWT),
			],
		},
		{
			id: 'devops',
			title: t(MentorFullstack.DEVELOPER_STACK_DEVOPS_TITLE),
			chips: [
				t(MentorFullstack.DEVELOPER_STACK_DEVOPS_DOCKER),
				t(MentorFullstack.DEVELOPER_STACK_DEVOPS_COMPOSE),
				t(MentorFullstack.DEVELOPER_STACK_DEVOPS_CICD),
				t(MentorFullstack.DEVELOPER_STACK_DEVOPS_NGINX),
				t(MentorFullstack.DEVELOPER_STACK_DEVOPS_LINUX),
				t(MentorFullstack.DEVELOPER_STACK_DEVOPS_KUBERNETES),
				t(MentorFullstack.DEVELOPER_STACK_DEVOPS_GITOPS),
			],
		},
		{
			id: 'ai',
			title: t(MentorFullstack.DEVELOPER_STACK_AI_TITLE),
			chips: [
				t(MentorFullstack.DEVELOPER_STACK_AI_CODEX),
				t(MentorFullstack.DEVELOPER_STACK_AI_CLAUDE),
				t(MentorFullstack.DEVELOPER_STACK_AI_COPILOT),
				t(MentorFullstack.DEVELOPER_STACK_AI_LLM),
				t(MentorFullstack.DEVELOPER_STACK_AI_AUTOMATION),
				t(MentorFullstack.DEVELOPER_STACK_AI_TESTS),
			],
		},
	];

	return (
		<div className={styles.list}>
			{cards.map((card) => (
				<DeveloperStackCard key={card.id} title={card.title} chips={card.chips} />
			))}
		</div>
	);
};
