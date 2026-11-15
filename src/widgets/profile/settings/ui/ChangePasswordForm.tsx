'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import type { ChangePasswordResult } from '@/entities/auth';
import { i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { Text } from '@/shared/ui/Text';

import { createChangePasswordSchema } from '../lib/changePasswordSchema';
import type { ChangePasswordValues } from '../lib/changePasswordSchema';
import styles from './ChangePasswordForm.module.css';

export type ChangePasswordAction = (values: ChangePasswordValues) => Promise<ChangePasswordResult>;
// No password draft is retained here; only request/feedback state lives across hash navigation.
export const usePasswordSubmission = (action?: ChangePasswordAction) => {
	const [pending, setPending] = useState(false);
	const [result, setResult] = useState<ChangePasswordResult | null>(null);
	const busy = useRef(false);
	const mounted = useRef(false);
	const blocked = result?.status === 'incomplete' || result?.status === 'outcome-unknown';
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const submit = useCallback(
		async (values: ChangePasswordValues) => {
			if (!action || busy.current || blocked) return;
			busy.current = true;
			setPending(true);
			setResult(null);
			let response: ChangePasswordResult;
			try {
				response = await action({
					password: values.password,
					passwordConfirm: values.passwordConfirm,
				});
			} catch {
				// A rejected/lost Action response cannot prove the mutation did not happen.
				response = { status: 'outcome-unknown' };
			} finally {
				busy.current = false;
				if (mounted.current) setPending(false);
			}
			if (mounted.current) setResult(response);
			return response;
		},
		[action, blocked],
	);
	return { pending, result, blocked, submit };
};

export const ChangePasswordForm = ({
	controller,
}: {
	controller: ReturnType<typeof usePasswordSubmission>;
}) => {
	const t = useTranslations(i18Namespace.profile);
	const common = useTranslations(i18Namespace.translation);
	const schema = createChangePasswordSchema({
		required: common('validation.required'),
		min: common('validation.length.min', { count: 8 }),
		max: common('validation.length.max', { count: 255 }),
		weak: common('validation.password.weak'),
		similar: common('validation.password.similar'),
	});
	const methods = useForm<ChangePasswordValues>({
		resolver: yupResolver(schema),
		mode: 'onTouched',
		defaultValues: { password: '', passwordConfirm: '' },
	});
	const mounted = useRef(false);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const { errors, isValid } = methods.formState;
	const submit = (event: FormEvent<HTMLFormElement>) => {
		void methods.handleSubmit(async (values) => {
			const result = await controller.submit(values);
			if (result?.status === 'success' && mounted.current)
				methods.reset({ password: '', passwordConfirm: '' });
		})(event);
	};
	const status = controller.result?.status;
	const feedback = status ? `settings.password.${status}` : null;
	return (
		<FormProvider {...methods}>
			<Card>
				<div className={styles.header}>
					<Text variant="head3">{t('change.password.title')}</Text>
					<Text variant="body3">{t('change.password.description')}</Text>
				</div>
				<form onSubmit={submit} noValidate aria-busy={controller.pending}>
					<div className={styles.row}>
						<div className={styles.field}>
							<PasswordInput
								name="password"
								label={t('change.password.label')}
								placeholder={t('change.password.placeholder')}
								error={errors.password?.message}
							/>
						</div>
						<div className={styles.field}>
							<PasswordInput
								name="passwordConfirm"
								label={t('change.password.repeat.label')}
								placeholder={t('change.password.placeholder')}
								error={errors.passwordConfirm?.message}
							/>
						</div>
						<Button
							size="large"
							type="submit"
							className={styles.submit}
							disabled={!isValid || controller.pending || controller.blocked}
						>
							{t('edit.save.button')}
						</Button>
					</div>
				</form>
				{feedback && (
					<div role={status === 'success' ? 'status' : 'alert'}>
						<Text variant="body3">{t(feedback)}</Text>
					</div>
				)}
			</Card>
		</FormProvider>
	);
};
