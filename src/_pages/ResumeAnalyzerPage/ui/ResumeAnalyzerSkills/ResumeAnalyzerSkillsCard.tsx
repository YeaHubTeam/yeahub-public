import classNames from 'classnames';

import { resumeAnalysis } from '@/entities/vacancy';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import styles from './ResumeAnalyzerSkillsCard.module.css';
import { ResumeAnalyzerSkillsCardHeader } from './ResumeAnalyzerSkillsCardHeader/ResumeAnalyzerSkillsCardHeader';
import { ResumeAnalyzerSkillsCardList } from './ResumeAnalyzerSkillsCardList/ResumeAnalyzerSkillsCardList';

export const ResumeAnalyzerSkillsCard = () => {
	return (
		<Card className={classNames(styles.card)} withOutsideShadow>
			<Flex direction="column" gap="10">
				<ResumeAnalyzerSkillsCardHeader
					totalMatched={resumeAnalysis.keywords.totalMatched}
					totalKeywords={resumeAnalysis.keywords.totalVacancyKeywords}
					title={'Навыки'}
				/>
				<div className={styles.flex}>
					<ResumeAnalyzerSkillsCardList
						keywords={resumeAnalysis.keywords.matchedKeywords}
						color={'purple'}
						title={'Есть в резюме'}
					/>
					<ResumeAnalyzerSkillsCardList
						keywords={resumeAnalysis.keywords.missingKeywords}
						color={'red'}
						title={'Не хватает'}
					/>
				</div>
			</Flex>
		</Card>
	);
};
