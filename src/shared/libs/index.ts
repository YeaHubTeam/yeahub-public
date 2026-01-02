export { type Pallete, type Response, type Author, type SortOrder } from './types';

export {
	COUNT_TO_GET_QUESTIONS_FOR_SSG,
	COUNT_TO_GET_COLLECTIONS_FOR_SSG,
	DEFAULT_SPECIALIZATION_NUMBER,
	MAX_LIMIT_CATEGORIES,
	MAX_CHOOSE_QUESTION_COUNT,
	COLLECTION_QUESTIONS_LIMIT,
	MAX_LIMIT_RESOURCES,
	QUESTIONS_PER_PAGE,
	DEFAULT_SPECIALIZATION_SLUG,
	RESOURCES_PER_PAGE,
	getSpecializationSlugById,
} from './query';
export { SPEC_MAP, SPEC_MAP_TO_TITLE } from './query';
export { route } from './query';
export { slugifyQuestionTitle } from './query/slugifyQuestionTitle';
export { useDebounce } from './fp';
export { getArrayFromTwoNumbers } from './fp';
export { useModal } from './fp';
export { useScreenSize } from './dom/useScreenSize';
export { parseNumberArray } from './fp/parseNumberArray';
export { parseStringArray } from './fp/parseStringArray';
export { AVOS_TELEGRAM_URL } from './app';
