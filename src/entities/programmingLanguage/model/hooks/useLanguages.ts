import { useFetchData } from '@/shared/api';

import { getLanguages } from '../../api/getLanguages';
import type { GetLanguagesResponse } from '../types/programmingLanguage';

export const useLanguages = (initialData?: GetLanguagesResponse | null) => {
	return useFetchData<GetLanguagesResponse, undefined>({
		fetcher: () => getLanguages(),
		params: undefined,
		initialData: initialData ?? null,
	});
};
