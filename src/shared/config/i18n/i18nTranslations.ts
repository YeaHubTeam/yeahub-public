export enum Translation {
	RETURN = 'return',
	SHOW_ALL = 'show_all',
	HIDE = 'hide',
	AVATAR = 'avatar',
	AUTHOR = 'author',

	/* Stub */
	RESET_FILTERS = 'stub.filter.submit',
	STUB_FILTER_TITLE = 'stub.filter.title',
	STUB_FILTER_SUBTITLE = 'stub.filter.subtitle',
	STUB_ERROR_TITLE = 'stub.error.title',
	STUB_ERROR_SUBTITLE = 'stub.error.subtitle',
	STUB_ERROR_SUBMIT = 'stub.error.submit',

	/* Access Denied */
	ACCESS_DENIED_TITLE = 'access.denied.title',
	ACCESS_DENIED_DESCRIPTION = 'access.denied.description',
	ACCESS_DENIED_BUTTON = 'access.denied.button',
	MODE_SELECT_TOOLTIP_PREMIUM_ONLY = 'mode.select.tooltip.premium.only',

	QUESTIONS_COUNT_AVAILABLE_AUTHORIZED = 'questions-count-available',
	LOGIN_REGISTER_LINK = 'banner-authorized',

	/* Error 404 */
	ERROR_404_TITLE = 'error-404.title',
	ERROR_404_BUTTON = 'error-404.button',
}

export enum Header {
	NAV_QUESTIONS = 'nav.questions',
	NAV_RESOURCES = 'nav.resources',
	NAV_QUIZ = 'nav.quiz',
	NAV_COLLECTIONS = 'nav.collections',
	NAV_TRAINER = 'nav.trainer',
	NAV_HH_ANALYTICS = 'nav.hhAnalytics',
	NAV_LEARNING = 'nav.learning',
	AUTH_SIGN_IN = 'auth.signIn',
	AUTH_SIGN_UP = 'auth.signUp',
	AUTH_MENU_ARIA = 'auth.menuAria',
	LOGO_ALT = 'logoAlt',
}

export enum Main {
	PROJECT_TITLE = 'project.title',
	PROJECT_DESCRIPTION = 'project.description',
	HOME_TITLE = 'home.title',
	HOME_SUBTITLE = 'home.subtitle',
	HOME_DEPLOY_NOW = 'home.deployNow',
	HOME_READ_DOCS = 'home.readDocs',
	HOME_LANGUAGE_LABEL = 'language.label',
	HOME_LANGUAGE_RUSSIAN = 'language.russian',
	HOME_LANGUAGE_ENGLISH = 'language.english',
}

export enum Footer {
	HOME_TITLE = 'title',
	HOME_DESCRIPTION = 'description',
	HOME_DOCS = 'docs',
	HOME_MEDIA = 'media',
	HOME_LINKS_LINK_ARIA = 'links.link.aria-label',
}

export enum Questions {
	SHORT_ANSWER_TITLE = 'short.answer.title',
	LONG_ANSWER_TITLE = 'long.answer.title',
	ADDITIONAL_INFO_LEVEL = 'additional.info.level',
	ADDITIONAL_INFO_SKILLS = 'additional.info.skills',
	ADDITIONAL_INFO_KEYWORDS = 'additional.info.keywords',
	QUESTIONS_TITLE = 'questions_title',
	QUESTIONS_RATE = 'questions.rate',
	QUESTIONS_COMPLEXITY = 'questions.complexity',
	QUESTIONS_LINK = 'questions.link',
	QUESTIONS_RATE_TITLE = 'questions.rate_title',
	QUESTIONS_SEARCH_PLACEHOLDER = 'search.placeholder',
	QUESTIONS_STATUS_UNLEARNED = 'questions.status.unlearned',
	QUESTIONS_STATUS_LEARNED = 'questions.status.learned',
	QUESTIONS_STATUS_ALL = 'questions.status.all',
	QUESTIONS_STATUS_FAVORITE = 'questions.status.favorite',
	QUESTIONS_STATUS_TITLE = 'questions.status.title',
	PREVIEW_TITLE = 'preview.title',
	COMMUNITY_JOIN = 'community.join',
	PREVIEW_LOCKED_COLLECTION = 'preview.locked.collection',
	PREVIEW_EMPTY_COLLECTION = 'preview.empty.collection',
	COUNT = 'count',

	STUB_EMPTY_TITLE = 'stub.empty.title',
	STUB_EMPTY_SUBTITLE = 'stub.empty.subtitle',
}

export enum Media {
	MEDIA_LINK_START = 'label.start',
	MEDIA_LINK_END = 'label.end',
	GURU_DESCRIPTION = 'banner.description',
	TELEGRAM_SUBSCRIBE = 'telegram.subscribe',
	TELEGRAM_DESCRIPTION = 'telegram.description',
}

export enum Specializations {
	TITLE_MAIN = 'title.main',
	SELECT_CHOOSE = 'select.choose',
	SELECT_EMPTY = 'select.empty',
	SELECT_SELECTED = 'select.selected',
}

export enum Skills {
	SELECT_CHOOSE = 'select.choose',
}

export enum Guru {
	BANNER_DESCRIPTION = 'banner.description',
}

export enum Avos {
	AVOS_TITLE = 'title',
	AVOS_SUBTITLE = 'subtitle',
	AVOS_INTERVIEWS = 'interviews',
	AVOS_LISTEN_PRACTICE = 'listen.practice',
	AVOS_LISTEN_JOIN = 'listen.join',
	AVOS_PROMO_CHIPS_REVIEWS = 'promo.chips.reviews',
	AVOS_PROMO_CHIPS_RECORDINGS = 'promo.chips.recordings',
	AVOS_PROMO_CHIPS_BREAKDOWNS = 'promo.chips.breakdowns',
	AVOS_PROMO_CHIPS_INTERVIEW = 'promo.chips.interview',
	AVOS_PROMO_CHIPS_GUIDES = 'promo.chips.guides',
	AVOS_PROMO_CHIPS_CONTACTS = 'promo.chips.contacts',
	AVOS_PROMO_ABOUT = 'promo.about',
	AVOS_PROMO_LEARN = 'promo.learn',
	AVOS_PROMO_SUM = 'promo.sum',
	AVOS_PROMO_WARN = 'promo.warn',
	AVOS_PROMO_JOIN_PRICE = 'promo.join.price',
}

export enum Learning {
	BANNER_TITLE = 'advantages.main.title',
	BANNER_DESCRIPTION = 'advantages.main.description',
	PROCESS_TITLE = 'advantages.process.title',
	PROCESS_DESCRIPTION = 'advantages.process.description',
	TECHNO_TITLE = 'advantages.techno.title',
	TECHNO_DESCRIPTION = 'advantages.techno.description',
	TEAM_TITLE = 'advantages.team.title',
	TEAM_DESCRIPTION = 'advantages.team.description',
	SUPPORT_TITLE = 'advantages.support.title',
	SUPPORT_DESCRIPTION = 'advantages.support.description',
	PROJECT_TITLE = 'advantages.project.title',
	PROJECT_DESCRIPTION = 'advantages.project.description',
	EXPERIENCE_TITLE = 'advantages.experience.title',
	EXPERIENCE_DESCRIPTION = 'advantages.experience.description',
	MENTORS_TITLE = 'mentors.title',
	MENTORS_DESCRIPTION = 'mentors.description',
	MENTORS_LINK = 'mentors.link',
	MENTORS_BANNER = 'mentors.banner',
	GURU_TITLE = 'guru.title',
	GURU_DESCRIPTION = 'guru.description',
	GURU_BANNER = 'guru.banner',
	GURU_BADGE = 'guru.badge',
	GURU_LINK = 'guru.link',
}

export enum Collections {
	TITLE_FULL = 'title.full',
	TITLE_SHORT = 'title.short',
	TITLE_LABEL = 'title.label',
	DESCRIPTION_FULL = 'description.full',
	DESCRIPTION_SHORT = 'description.short',
	DESCRIPTION_LABEL = 'description.label',
	DESCRIPTION_PLACEHOLDER = 'description.placeholder',
	ICON_TITLE = 'icon.title',
	ICON_TITLE_SHORT = 'icon.title-short',
	ICON_LABEL = 'icon.label',
	TARIFF_CHOOSE = 'tariff.chooseCollections',
	TARIFF_LABEL = 'tariff.label',
	TARIFF_PAID = 'tariff.paid',
	TARIFF_FREE = 'tariff.free',
	SELECT_SELECTED = 'select.selected',
	EMPTY = 'empty',
	STUB_EMPTY_TITLE = 'stub-empty.title',
	STUB_EMPTY_SUBTITLE = 'stub-empty.subtitle',
	IMAGE_SRC = 'image-src',
	CREATE_PAGE_TITLE = 'create-page-title',
	EDIT_PAGE_TITLE = 'edit.page.title',
	ADDITIONAL_INFO_ACCESS = 'access',
	ADDITIONAL_INFO_ARIA_LABEL = 'additional.aria-label',
	QUESTIONS_SHORT = 'questions.short',
	QUESTIONS_LABEL = 'questions.label',
	QUESTIONS_SELECTED = 'questions.selected',
	QUESTIONS_ADDITIONAL_INFO = 'numberOfQuestions',
	QUESTIONS_COUNT = 'questions.length',
	IMAGE_ALT = 'image-alt',
	SEARCH_PLACEHOLDER = 'search.placeholder',
	COLLECTIONS_TITLE = 'collections.title',
	COLLECTIONS_DETAIL = 'collections.detail',
	COLLECTIONS_TRAIN = 'collections.train',
	SPECIALIZATIONS_SHOW_ALL = 'specializations.show-all',
	SPECIALIZATIONS_HIDE = 'specializations.hide',
	SPECIALIZATION_TITLE = 'specialization.title',
	SPECIALIZATION_LABEL = 'specialization.label',
	KEYWORDS_TITLE = 'keywords.title',
	KEYWORDS_LABEL = 'keywords.label',
	TAGS_TITLE = 'tags.title',
	TOOLTIP_TITLE = 'tooltip.title',
	TOOLTIP_ARIA_LABEL = 'tooltip.aria-label',
	COMPANY_TITLE = 'company.title',
	COMPANY_LABEL = 'company.label',
	NAVIGATION_PREVIOUS = 'navigation.previous',
	NAVIGATION_NEXT = 'navigation.next',

	WARNING_INTRO = 'warning.intro',
	WARNING_DISCLAIMER = 'warning.disclaimer',

	BANNER_INTERVIEW_TITLE = 'banner-interview.title',
	BANNER_INTERVIEW_DESCRIPTION = 'banner-interview.description',
	BANNER_INTERVIEW_LINK = 'banner-interview.link',
	BANNER_INTERVIEW_WATCH_BUTTON = 'banner-interview.watch-button',
	SORT_AUTHOR_TITLE = 'sort.author.title',
}

export enum InterviewQuiz {
	TITLE = 'title',
	COMPLETE = 'complete',
	NEXT = 'next',
	CHECK = 'check.quiz',
	A11Y_NEXT = 'a11y.next',
	A11Y_PREV = 'a11y.prev',
	ANSWER_SHOW = 'answer.show',
	ANSWER_HIDE = 'answer.hide',
	ANSWER_DO_NOT_KNOW = 'answer.doNotKnow',
	ANSWER_KNOW = 'answer.know',
}

export enum InterviewQuizCreate {
	TITLE = 'title',
	CREATE_BUTTON = 'create.button',
	MODE_REPEAT = 'mode.repeat',
	MODE_NEW = 'mode.new',
	MODE_RANDOM = 'mode.random',
	MODE_SELECT = 'mode.select.select',
	MODE_SELECT_TOOLTIP_UNAUTHORIZED = 'mode.select.tooltip.unauthorized',
}

export enum Analytics {
	HH_ANALYTICS_TITLE_SKILLS = 'hhAnalytics.title.skills',
	HH_ANALYTICS_TITLE_KEYWORDS = 'hhAnalytics.title.keywords',
	HH_ANALYTICS_TAB_SKILLS = 'hhAnalytics.tab.skills',
	HH_ANALYTICS_TAB_KEYWORDS = 'hhAnalytics.tab.keywords',
	HH_ANALYTICS_TABLE_INDEX = 'hhAnalytics.table.index',
	HH_ANALYTICS_TABLE_SKILLS = 'hhAnalytics.table.skills',
	HH_ANALYTICS_TABLE_KEYWORDS = 'hhAnalytics.table.keywords',
	HH_ANALYTICS_TABLE_COUNT = 'hhAnalytics.table.count',
}

export enum Resources {
	HEADER_TITLE = 'header.title',
	SEARCH_PLACEHOLDER = 'search.placeholder',
	RESOURCES_TITLE = 'resources.title',
	STUB_EMPTY_RESOURCES_TITLE = 'stub.empty.resources.title',
	STUB_EMPTY_RESOURCES_SUBTITLE = 'stub.empty.resources.subtitle',
}

export enum Landing {
	BANNER_STICKER_SKILL = 'banner.sticker.skill',
	BANNER_STICKER_CANDIDATE = 'banner.sticker.candidate',
	BANNER_TITLE = 'banner.title',
	BANNER_DESCRIPTION = 'banner.description',
	BANNER_BUTTON = 'banner.button',
	BANNER_IMG_HOMEPAGE = 'banner.img.homepage',
	BANNER_IMG_STATISTICS = 'banner.img.statistics',
	BANNER_IMG_COMPANY = 'banner.img.company',
	BANNER_IMG_PROGRESS = 'banner.img.progress',
	SPECIALIZATION_NEW_TITLE = 'specialization.title_new',
	SPECIALIZATION_BUTTON = 'specialization.button',
	SPECIALIZATION_CARD_DESCRIPTION_FRONTEND = 'specialization.card.description.frontend',
	SPECIALIZATION_CARD_DESCRIPTION_BACKEND = 'specialization.card.description.backend',
	SPECIALIZATION_CARD_DESCRIPTION_DATA = 'specialization.card.description.data',
	SPECIALIZATION_CARD_DESCRIPTION_MACHINE = 'specialization.card.description.machine',
	SPECIALIZATION_CARD_DESCRIPTION_TESTING = 'specialization.card.description.testing',
	SPECIALIZATION_CARD_DESCRIPTION_IOS = 'specialization.card.description.ios',
	SPECIALIZATION_CARD_DESCRIPTION_ANDROID = 'specialization.card.description.android',
	SPECIALIZATION_CARD_DESCRIPTION_GAME = 'specialization.card.description.game',
	SPECIALIZATION_CARD_IMG_FRONTEND = 'specialization.card.img.frontend',
	SPECIALIZATION_CARD_IMG_BACKEND = 'specialization.card.img.backend',
	SPECIALIZATION_CARD_IMG_DATA = 'specialization.card.img.data',
	SPECIALIZATION_CARD_IMG_MACHINE = 'specialization.card.img.machine',
	SPECIALIZATION_CARD_IMG_TESTING = 'specialization.card.img.testing',
	SPECIALIZATION_CARD_IMG_IOS = 'specialization.card.img.ios',
	SPECIALIZATION_CARD_IMG_ANDROID = 'specialization.card.img.android',
	SPECIALIZATION_CARD_IMG_GAME = 'specialization.card.img.game',
	SPECIALIZATION_CARD_BUTTON = 'specialization.card.button',
}
