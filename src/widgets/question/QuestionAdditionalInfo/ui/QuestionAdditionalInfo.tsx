'use server';

import classnames from 'classnames';
import { getTranslations } from 'next-intl/server';

import { QuestionGradeList } from '@/entities/question';
import { Skill, SkillList } from '@/entities/skill';
import { MediaLinksBanner, getChannelsForSpecialization } from '@/entities/socialMedia';
import { Specialization } from '@/entities/specialization/@x/question';
import { i18Namespace } from '@/shared/config';
import { Questions } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { KeywordsList } from '@/shared/ui/KeywordsList';
import { Text } from '@/shared/ui/Text';

import styles from './QuestionAdditionalInfo.module.css';

export interface QuestionAdditionalInfoProps {
	rate: number;
	complexity: number;
	keywords: string[];
	questionSkills: Skill[];
	className?: string;
	questionSpecializations: Specialization[];
}

export const QuestionAdditionalInfo = async ({
	rate,
	complexity,
	questionSkills,
	keywords,
	className,
	questionSpecializations,
}: QuestionAdditionalInfoProps) => {
	const t = await getTranslations(i18Namespace.questions);
	const media = getChannelsForSpecialization(questionSpecializations);

	return (
		<Card className={classnames(styles.additional, className)} withOutsideShadow>
			<Flex direction="column" gap="24">
				<Flex direction="column" gap="8">
					<Text variant="body3" color="black-700">
						{t(Questions.ADDITIONAL_INFO_LEVEL)}
					</Text>
					<QuestionGradeList
						rate={rate}
						complexity={complexity}
						className={styles['header-params']}
					/>
				</Flex>
				<Flex direction="column" gap="8">
					<Text variant="body3" color="black-700">
						{t(Questions.ADDITIONAL_INFO_SKILLS)}
					</Text>
					<SkillList skills={questionSkills} />
				</Flex>
				<Flex direction="column" gap="8">
					<Text variant="body3" color="black-700">
						{t(Questions.ADDITIONAL_INFO_KEYWORDS)}
					</Text>
					<KeywordsList keywords={keywords} />
				</Flex>
				{media && (
					<MediaLinksBanner
						mediaLink={{
							title: media.title,
							link: media.link,
							specializationId: media.specializationId,
						}}
					/>
				)}
			</Flex>
		</Card>
	);
};
