import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './ProfileStack.module.css';

interface ProfileStackProps {
	profile: ResumeAnalysis['profile'];
}

export const ProfileStack = ({ profile }: ProfileStackProps) => {
	const t = useTranslations(i18Namespace.vacancies);
	const isStackMatched = profile.hasStackSection;

	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.card}
			contentClassName={styles.content}
			title={t(Vacancies.RESUME_ANALYZER_PROFILE_STACK)}
		>
			<Flex direction="column" align="start" gap="20">
				<Flex direction="column" gap="8">
					<Text variant="body3-accent">{t(Vacancies.RESUME_ANALYZER_PROFILE_STACK_SUBTITLE)}</Text>

					<Text variant="body3-accent" color="black-500">
						{t(Vacancies.RESUME_ANALYZER_PROFILE_STACK_DESCRIPTION)}
					</Text>
				</Flex>
				<Flex align="start" gap="8">
					<Icon
						icon={isStackMatched ? 'successCircle' : 'errorCircle'}
						size={16}
						color={isStackMatched ? 'green-700' : 'red-800'}
						className={classNames(
							styles.icon,
							styles[`icon-${isStackMatched ? 'success' : 'error'}`],
						)}
						aria-hidden
					/>

					<Text variant="body3-accent" color="black-900">
						{t(Vacancies.RESUME_ANALYZER_PROFILE_STACK_MATCHED)}
					</Text>
				</Flex>
			</Flex>
		</Card>
	);
};
