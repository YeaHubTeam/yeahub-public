'use client';

import { useTranslations } from 'next-intl';

import { StatusFilterSection } from '@/widgets/question/QuestionsFilterPanel';

import { ChooseQuestionComplexity, RateFilterSection } from '@/entities/question';
import { GetSkillsListResponse, SkillsListField } from '@/entities/skill';
import { MediaLinksBanner } from '@/entities/socialMedia';
import {
	GetSpecializationsListResponse,
	Specialization,
	SpecializationsListField,
	SpecializationsListFieldSkeleton,
} from '@/entities/specialization';
import { Questions, Specializations, i18Namespace, Link, ROUTES } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';

import { useQuestionsFilter } from '../../api/useQuestionsFilter';
import { usePersonalQuestionsList } from '../QuestionListPersonalState';

import styles from './QuestionsFilterPanel.module.css';

interface QuestionsFilterPanelProps {
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
	inDrawer?: boolean;
}

export const QuestionsFilterPanel = ({
	initialSpecializations,
	initialSkills,
	currentSpecialization,
	inDrawer = false,
}: QuestionsFilterPanelProps) => {
	const t = useTranslations(i18Namespace.questions);
	const tProfile = useTranslations(i18Namespace.profile);
	const tSpecialization = useTranslations(i18Namespace.specialization);
	const personal = usePersonalQuestionsList();
	const capabilities = personal.result && 'userId' in personal.result ? personal.result : null;
	const canFilter = capabilities && personal.result?.status !== 'redirect';
	const { filter, selectedSpecialization, media, handlers } =
		useQuestionsFilter(currentSpecialization);

	return (
		<Flex direction="column" gap="24" className={styles.panel}>
			<SearchInput
				placeholder={t(Questions.QUESTIONS_SEARCH_PLACEHOLDER)}
				onSearch={handlers.onSearch}
				currentValue={filter.title}
			/>
			<Flex direction="column" gap="8" align="start">
				{personal.guest ? (
					<SpecializationsListField
						selectedSpecialization={selectedSpecialization}
						onChangeSpecialization={handlers.onChangeSpecialization}
						initialData={initialSpecializations}
					/>
				) : canFilter ? (
					<BaseFilterSection
						title={tSpecialization(Specializations.TITLE_MAIN)}
						data={[{ id: currentSpecialization.id, title: currentSpecialization.title }]}
						disabled
						onClick={handlers.onChangeSpecialization}
					/>
				) : personal.loading || personal.result?.status === 'redirect' ? (
					<SpecializationsListFieldSkeleton />
				) : null}
				{!personal.guest && !personal.sessionLoading && (
					<Link href={`${ROUTES.settings.page}#account`} className={styles['specialization-link']}>
						{tProfile('form.switch.specialization')}
					</Link>
				)}
			</Flex>
			<SkillsListField
				expandOnMobile={inDrawer}
				selectedSkills={filter.skills}
				onChangeSkills={handlers.onChangeSkills}
				selectedSpecialization={selectedSpecialization}
				initialData={initialSkills}
			/>
			<ChooseQuestionComplexity
				onChangeComplexity={handlers.onChangeComplexity}
				selectedComplexity={filter.complexity}
			/>
			<RateFilterSection onChangeRate={handlers.onChangeRate} selectedRate={filter.rate} />
			<StatusFilterSection
				selectedStatus={filter.status}
				hasPremium={capabilities?.hasPremiumAccess === true}
				onChangeStatus={canFilter ? handlers.onChangeStatus : undefined}
			/>
			{media && <MediaLinksBanner mediaLink={media} />}
		</Flex>
	);
};
