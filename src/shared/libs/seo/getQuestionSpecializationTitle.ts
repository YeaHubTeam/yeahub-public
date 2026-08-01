interface SpecializationTitleSource {
	slug: string;
	title: string;
}

export const getQuestionSpecializationTitle = (
	specializations?: SpecializationTitleSource[] | null,
	specializationSlug?: string,
): string | undefined => {
	if (!specializations?.length) {
		return undefined;
	}

	return (
		specializations.find((specialization) => specialization.slug === specializationSlug)?.title ??
		specializations[0]?.title
	);
};
