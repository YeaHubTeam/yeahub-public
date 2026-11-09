export interface LoginFormValues {
	username: string;
	password: string;
}

export type SignUpFormValues = {
	username: string;
	email: string;
	password: string;
	passwordConfirmation: string;
	isChecked: boolean;
	privacyConsent: boolean;
	offerConsent: boolean;
	adConsent: boolean;
};
