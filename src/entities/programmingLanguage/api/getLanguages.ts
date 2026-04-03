import { apiFetch } from '@/shared/api';

import { GetLanguagesResponse } from '../model/types/programmingLanguage';

const languageApiUrls = {
	getLanguages: 'api/v1/live-coding/languages',
};

export async function getLanguages() {
	return apiFetch<GetLanguagesResponse>(languageApiUrls.getLanguages);
}
