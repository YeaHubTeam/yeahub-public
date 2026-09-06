import { capitalizeFirstLetter } from '@/shared/libs';

import { ResumeAnalysis, ResumeAnalysisExternal } from '../model/types/resumeAnalysis';

export const mapResumeAnalysis = (resumeAnalysis: ResumeAnalysisExternal): ResumeAnalysis => {
	return {
		...resumeAnalysis,
		tasks: {
			...resumeAnalysis.tasks,
			matchedTasks: resumeAnalysis.tasks.matchedTasks
				.filter((matchedTask) => matchedTask.matchType === 'full')
				.map((matchedTask) => ({
					title: capitalizeFirstLetter(matchedTask.title),
					evidence: matchedTask.evidence,
				})),
			missingTasks: resumeAnalysis.tasks.missingTasks.map((missingTask) => ({
				title: capitalizeFirstLetter(missingTask),
				evidence: '',
			})),
		},
		profile: {
			...resumeAnalysis.profile,
			matchedExtraSignals: resumeAnalysis.profile.matchedExtraSignals.map((matchedExtraSignal) => ({
				title: capitalizeFirstLetter(matchedExtraSignal.title),
				evidence: matchedExtraSignal.evidence,
			})),
			missingExtraSignals: resumeAnalysis.profile.missingExtraSignals.map((missingExtraSignal) => ({
				title: capitalizeFirstLetter(missingExtraSignal.title),
				evidence: missingExtraSignal.evidence,
			})),
			projectScopeSignals: resumeAnalysis.profile.projectScopeSignals.map((projectScopeSignal) => ({
				title: projectScopeSignal,
				evidence: '',
			})),
			missingProjectElements: resumeAnalysis.profile.missingProjectElements.map(
				(missingProjectElement) => ({
					title: capitalizeFirstLetter(missingProjectElement),
					evidence: '',
				}),
			),
			weaklySupportedSignals: resumeAnalysis.profile.weaklySupportedSignals.map(
				(weaklySupportedSignal) => ({
					title: capitalizeFirstLetter(weaklySupportedSignal.title),
					evidence: weaklySupportedSignal.evidence,
				}),
			),
			presentSections: resumeAnalysis.profile.presentSections.map((presentSection) => ({
				title: presentSection,
				evidence: '',
			})),
			missingSections: resumeAnalysis.profile.missingSections.map((missingSection) => ({
				title: missingSection,
				evidence: '',
			})),
			quantifiedAchievements: resumeAnalysis.profile.quantifiedAchievements.map(
				(quantifiedAchievement) => ({
					title: quantifiedAchievement.text,
					evidence: quantifiedAchievement.comment,
				}),
			),
			unquantifiedAchievements: resumeAnalysis.profile.unquantifiedAchievements.map(
				(unquantifiedAchievement) => ({
					title: unquantifiedAchievement.text,
					evidence: unquantifiedAchievement.comment,
				}),
			),
		},
	};
};
