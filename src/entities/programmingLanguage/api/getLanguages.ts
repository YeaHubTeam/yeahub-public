import { apiFetch } from '@/shared/api';

import { languageApiUrls } from '../model/constants/programmingLanguage';
import { GetLanguagesResponse } from '../model/types/programmingLanguage';

export async function getLanguages() {
	return apiFetch<GetLanguagesResponse>(languageApiUrls.getLanguages);
}
