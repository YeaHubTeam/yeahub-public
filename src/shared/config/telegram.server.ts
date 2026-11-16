import 'server-only';

export type TelegramWidgetConfigResult =
	| { status: 'success'; botUsername: string }
	| { status: 'missing' | 'invalid' };

// Format only, not existence/domain verification: https://core.telegram.org/method/bots.checkUsername
export const getTelegramWidgetConfig = (): TelegramWidgetConfigResult => {
	const value = process.env.TELEGRAM_BOT_NAME;
	if (value === undefined || value === '') return { status: 'missing' };
	if (
		value.length < 5 ||
		value.length > 32 ||
		/[^a-z0-9_]/i.test(value) ||
		value.slice(-3).toLowerCase() !== 'bot'
	) {
		return { status: 'invalid' };
	}
	return { status: 'success', botUsername: value };
};
