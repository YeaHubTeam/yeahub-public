import i18next, { TFunction } from 'i18next';
import HttpBackend from 'i18next-http-backend';

let instance: typeof i18next | null = null;

export async function getServerT(
	lng: string,
	ns: string | string[] = 'translation',
): Promise<TFunction> {
	if (!instance) {
		instance = i18next.createInstance();
		await instance.use(HttpBackend).init({
			lng,
			fallbackLng: 'ru',
			ns: Array.isArray(ns) ? ns : [ns],
			backend: {
				// TODO: нужно будет изменить на переменные окружения
				loadPath: `http://localhost:${process.env.PORT ?? 3000}/locales/{{lng}}/{{ns}}.json`,
			},
			interpolation: { escapeValue: false },
		});
	} else {
		await instance.changeLanguage(lng);
		if (Array.isArray(ns)) void instance.loadNamespaces(ns);
		else void instance.loadNamespaces([ns]);
	}

	return instance.t.bind(instance);
}
