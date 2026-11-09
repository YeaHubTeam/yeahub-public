import * as yup from 'yup';

import { emailRule } from '@/shared/libs';

interface LoginValidationMessages {
	email: string;
	required: string;
}

export const createLoginSchema = ({ email, required }: LoginValidationMessages) =>
	yup.object().shape({
		username: yup.string().trim().matches(emailRule, email).required(required),
		password: yup.string().required(required),
	});
