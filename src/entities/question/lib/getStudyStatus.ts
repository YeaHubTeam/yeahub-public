export type StudyStatus = 'learned' | 'in-progress' | 'not-learned';

// Accept only a known, normalized personal count; never default a missing response.
export const getStudyStatus = (checksCount: number): StudyStatus => {
	if (checksCount >= 3) return 'learned';
	if (checksCount > 0) return 'in-progress';
	return 'not-learned';
};
