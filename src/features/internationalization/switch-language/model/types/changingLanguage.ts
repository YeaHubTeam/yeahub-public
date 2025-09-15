export enum Language {
	RU = 'ru',
	EN = 'en',
}

export interface ChangeLocaleRequest {
	locale: Language;
}

export interface ChangeLocaleResponse {
	ok: true;
}
