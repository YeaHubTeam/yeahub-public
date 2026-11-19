import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { StatusChip } from '@/shared/ui/StatusChip';
import type { StatusChipVariant } from '@/shared/ui/StatusChip';

import type { StudyStatus } from '../../lib/getStudyStatus';

interface QuestionStudyStatusProps {
	status: StudyStatus;
}

export const QuestionStudyStatus = ({ status }: QuestionStudyStatusProps) => {
	const t = useTranslations(i18Namespace.questions);
	const variantMap: Record<StudyStatus, StatusChipVariant> = {
		learned: 'green',
		'in-progress': 'yellow',
		'not-learned': 'red',
	};
	const labels: Record<StudyStatus, string> = {
		learned: t('study.status.learned'),
		'in-progress': t('study.status.in.progress'),
		'not-learned': t('study.status.not.learned'),
	};
	return <StatusChip status={{ text: labels[status], variant: variantMap[status] }} size="small" />;
};
