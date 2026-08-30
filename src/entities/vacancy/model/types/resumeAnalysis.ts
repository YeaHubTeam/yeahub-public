export type Overall = {
	score: number;
	label: string;
};

export type Keywords = {
	coveragePercent: number;
	matchedKeywords: string[];
	missingKeywords: string[];
	criticalKeywords: string[];
	optionalKeywords: string[];
	totalVacancyKeywords: number;
	totalMatched: number;
	recommendations: string[];
};

export type MatchedTasks = {
	title: string;
	matchType: 'full' | 'none';
	evidence: string;
	score: number;
};

export type Tasks = {
	matchedTasks: MatchedTasks[];
	recommendations: string[];
	missingTasks: string[];
	coveragePercent: number;
};

export type Profile = {
	hasProjectScope: boolean;
	projectScopeSignals: string[];
	missingProjectElements: string[];
	hasStackSection: boolean;
	matchedExtraSignals: string[];
	missingExtraSignals: string[];
	weaklySupportedSignals: string[];
	hasStructuredResume: boolean;
	presentSections: string[];
	missingSections: string[];
	recommendations: string[];
	quantifiedAchievementsPercent: number;
	unquantifiedAchievements: string[];
	extraMatchPercent: number;
	profileQualityScore: number;
};

export type ResumeAnalysis = {
	overall: Overall;
	keywords: Keywords;
	tasks: Tasks;
	profile: Profile;
};
