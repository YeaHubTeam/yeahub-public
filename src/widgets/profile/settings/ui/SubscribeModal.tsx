import { useEffect, useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import type { PaymentInitInput, PaymentInitResult } from '@/entities/subscription/index.server';
import { Link, ROUTES, i18Namespace, useRouter } from '@/shared/config';
import { emailRule } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Flex } from '@/shared/ui/Flex';
import { FormControl } from '@/shared/ui/FormControl';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { Text } from '@/shared/ui/Text';

import styles from './SubscribeModal.module.css';
import type { TariffMutationGate } from './TrialActivation';

export const paymentNavigation = { assign: (url: string) => window.location.assign(url) };

type Draft = { email: string; isOfferAgreed: boolean; isConsentAgreed: boolean };
export type PaymentAction = (input: PaymentInitInput) => Promise<PaymentInitResult>;
export const usePaymentCheckout = ({
	action,
	gate,
	email,
	isVerified,
}: {
	action?: PaymentAction;
	gate: TariffMutationGate;
	email: string | null;
	isVerified: boolean;
}) => {
	const common = useTranslations(i18Namespace.translation);
	const router = useRouter();
	const methods = useForm<Draft>({
		resolver: yupResolver(
			yup.object({
				email: yup
					.string()
					.matches(emailRule, () => common('validation.email'))
					.required(() => common('validation.required')),
				isOfferAgreed: yup
					.boolean()
					.oneOf([true], () => common('validation.required'))
					.required(),
				isConsentAgreed: yup
					.boolean()
					.oneOf([true], () => common('validation.required'))
					.required(),
			}),
		),
		mode: 'onTouched',
		defaultValues: { email: email ?? '', isOfferAgreed: false, isConsentAgreed: false },
	});
	const [state, setState] = useState<{
		owner: string | null;
		tariffId: number | null;
		open: boolean;
		url: string | null;
		toast: { variant: 'error'; payment: true } | null;
	}>({ owner: gate.identity, tariffId: null, open: false, url: null, toast: null });
	const initialOwner = useRef(gate.identity);
	const initialEmail = useRef(email);
	const previousEmail = useRef(email);
	const identity = gate.identity;
	if (state.owner !== identity)
		setState({ owner: identity, tariffId: null, open: false, url: null, toast: null });
	useEffect(() => {
		if (initialOwner.current === null && identity !== null) initialOwner.current = identity;
		methods.reset({
			email: identity === initialOwner.current ? (initialEmail.current ?? '') : '',
			isOfferAgreed: false,
			isConsentAgreed: false,
		});
		// Identity changes clear the entire draft; ordinary RSC props must not reset it.
	}, [identity, methods]);
	useEffect(() => {
		if (previousEmail.current !== email) {
			previousEmail.current = email;
			methods.setValue('email', email ?? '');
		}
	}, [email, methods]);
	useEffect(() => {
		if (!state.toast) return;
		const timer = setTimeout(() => setState((current) => ({ ...current, toast: null })), 3000);
		return () => clearTimeout(timer);
	}, [state.toast]);
	const current = state.owner === identity;
	const canOpen = (id: number) =>
		gate.ready &&
		!!action &&
		(gate.phase === 'idle' ||
			(current &&
				state.tariffId === id &&
				(gate.phase === 'payment-link-ready' || gate.phase === 'payment-pending')));
	const showError = () =>
		setState((value) => ({ ...value, toast: { variant: 'error', payment: true } }));
	const navigate = (url: string) => {
		try {
			paymentNavigation.assign(url);
		} catch {
			showError();
		}
	};
	const submit = async () => {
		if (!gate.ready || !action || !current || state.tariffId === null) return;
		if (gate.ref.current.phase === 'payment-link-ready' && state.url) {
			navigate(state.url);
			return;
		}
		if (gate.ref.current.phase !== 'idle') return;
		const scope = gate.ref.current.scope;
		const valid = await methods.trigger();
		if (!scope || gate.ref.current.scope !== scope || gate.ref.current.phase !== 'idle') return;
		if (!isVerified) {
			setState((value) => ({ ...value, open: false }));
			router.push(`${ROUTES.settings.page}#email-verify`);
			return;
		}
		if (!valid) return;
		gate.update('payment-pending');
		setState((value) => ({ ...value, toast: null }));
		let result: PaymentInitResult;
		try {
			const values = methods.getValues();
			result = await action({
				email: values.email,
				isOfferAgreed: values.isOfferAgreed,
				isConsentAgreed: values.isConsentAgreed,
				tariffId: state.tariffId,
			});
			if (
				!result ||
				![
					'success',
					'invalid-input',
					'unauthenticated',
					'refresh-required',
					'verification-required',
					'not-available',
					'forbidden',
					'conflict',
					'outcome-unknown',
					'error',
				].includes(result.status) ||
				(result.status === 'success' && typeof result.paymentUrl !== 'string')
			)
				throw new Error('Invalid payment result');
		} catch {
			result = { status: 'outcome-unknown' };
		}
		if (gate.ref.current.scope !== scope || gate.ref.current.owner !== identity) return;
		if (result.status === 'success') {
			gate.update('payment-link-ready');
			setState((value) => ({ ...value, url: result.paymentUrl }));
			navigate(result.paymentUrl);
			return;
		}
		gate.update(['outcome-unknown', 'conflict'].includes(result.status) ? 'blocked' : 'idle');
		showError();
		if (result.status === 'verification-required') {
			setState((value) => ({ ...value, open: false }));
			router.push(`${ROUTES.settings.page}#email-verify`);
		}
	};
	return {
		methods,
		emailDisabled: !!email,
		isOpen: current && state.open,
		toast: current ? state.toast : null,
		pending: gate.phase === 'payment-pending',
		disabled: !gate.ready || !action || !['idle', 'payment-link-ready'].includes(gate.phase),
		linkReady: current && !!state.url && gate.phase === 'payment-link-ready',
		canOpen,
		open: (id: number) => {
			if (canOpen(id))
				setState((value) => ({ ...value, owner: identity, tariffId: id, open: true }));
		},
		close: () => setState((value) => ({ ...value, open: false })),
		submit: () => {
			const scope = gate.ref.current.scope;
			void submit().catch(() => {
				if (scope && gate.ref.current.scope === scope && gate.ref.current.owner === identity) {
					gate.update('blocked');
					showError();
				}
			});
		},
	};
};
export type PaymentController = ReturnType<typeof usePaymentCheckout>;

export const SubscribeModal = ({ controller }: { controller: PaymentController }) => {
	const t = useTranslations(i18Namespace.subscription);
	const { methods } = controller;
	const agreements = methods.watch(['isOfferAgreed', 'isConsentAgreed']);
	if (!controller.isOpen) return null;

	return (
		<Modal
			title={t('subscribe.modal.title')}
			isOpen={controller.isOpen}
			onClose={controller.close}
			hasPadding={false}
			className={styles.modal}
			contentClassName={styles.content}
		>
			<FormProvider {...methods}>
				<form
					noValidate
					aria-busy={controller.pending}
					onSubmit={(event) => {
						event.preventDefault();
						controller.submit();
					}}
				>
					<Flex direction="column" gap="30">
						<Flex direction="column" gap="8">
							<FormControl
								name="email"
								control={methods.control}
								className={styles['form-control']}
							>
								{(field, error) => (
									<Input
										{...field}
										aria-label={t('subscribe.modal.email.input.value')}
										placeholder={t('subscribe.modal.email.input.value')}
										error={error}
										disabled={controller.emailDisabled}
									/>
								)}
							</FormControl>
							<Text variant="body1" color="black-600">
								{t('subscribe.modal.email.description')}
							</Text>
						</Flex>
						<Flex direction="column" gap="12">
							<Flex align="start" gap="8">
								<RenewalIcon />
								<Text variant="body2" color="black-700">
									{t('subscribe.modal.info.continue')}
								</Text>
							</Flex>
							<Flex align="start" gap="8">
								<CancelIcon />
								<Text variant="body2" color="black-700">
									{t('subscribe.modal.info.cancel')}
								</Text>
							</Flex>
						</Flex>
						<Flex direction="column" gap="16">
							<Text variant="body1" color="black-600">
								{t('subscribe.modal.privacy.title')}
							</Text>
							<Flex direction="column" gap="8">
								<FormControl
									name="isOfferAgreed"
									control={methods.control}
									className={styles['form-control']}
								>
									{(field) => (
										<Checkbox
											checked={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											label={
												<Text variant="body1" color="black-600">
													{t.rich('subscribe.modal.privacy.offer.agreement', {
														processingLink: (chunks) => (
															<Link href="/docs" target="_blank" rel="noopener noreferrer">
																{chunks}
															</Link>
														),
													})}
												</Text>
											}
										/>
									)}
								</FormControl>
								<FormControl
									name="isConsentAgreed"
									control={methods.control}
									className={styles['form-control']}
								>
									{(field) => (
										<Checkbox
											checked={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											label={
												<Text variant="body1" color="black-600">
													{t.rich('subscribe.modal.privacy.consent', {
														processingLink: (chunks) => (
															<Link href="/docs" target="_blank" rel="noopener noreferrer">
																{chunks}
															</Link>
														),
													})}
												</Text>
											}
										/>
									)}
								</FormControl>
							</Flex>
						</Flex>
						<Button
							type="submit"
							fullWidth
							size="large"
							aria-busy={controller.pending}
							disabled={
								controller.disabled || (!controller.linkReady && !agreements.every(Boolean))
							}
						>
							{t('subscribe.modal.button')}
						</Button>
					</Flex>
				</form>
			</FormProvider>
		</Modal>
	);
};

const RenewalIcon = () => (
	<svg
		aria-hidden="true"
		className={styles.icon}
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M6.875 8.125H3.125C2.95924 8.125 2.80027 8.05915 2.68306 7.94194C2.56585 7.82473 2.5 7.66576 2.5 7.5V3.75C2.5 3.58424 2.56585 3.42527 2.68306 3.30806C2.80027 3.19085 2.95924 3.125 3.125 3.125C3.29076 3.125 3.44973 3.19085 3.56694 3.30806C3.68415 3.42527 3.75 3.58424 3.75 3.75V5.61328C4.95859 4.25 7.07891 2.5 10 2.5C13.3453 2.5 15.3578 4.47422 15.4422 4.55781C15.5597 4.67488 15.6258 4.83382 15.6261 4.99968C15.6264 5.16553 15.5608 5.3247 15.4437 5.44219C15.3267 5.55967 15.1677 5.62584 15.0019 5.62613C14.836 5.62642 14.6769 5.56082 14.5594 5.44375C14.5383 5.42266 12.8062 3.75 10 3.75C7.26562 3.75 5.29453 5.67578 4.33125 6.875H6.875C7.04076 6.875 7.19973 6.94085 7.31694 7.05806C7.43415 7.17527 7.5 7.33424 7.5 7.5C7.5 7.66576 7.43415 7.82473 7.31694 7.94194C7.19973 8.05915 7.04076 8.125 6.875 8.125ZM16.875 11.875H13.125C12.9592 11.875 12.8003 11.9408 12.6831 12.0581C12.5658 12.1753 12.5 12.3342 12.5 12.5C12.5 12.6658 12.5658 12.8247 12.6831 12.9419C12.8003 13.0592 12.9592 13.125 13.125 13.125H15.6687C14.7055 14.3242 12.7344 16.25 10 16.25C7.19375 16.25 5.46172 14.5773 5.44062 14.5563C5.32314 14.4392 5.16397 14.3736 4.99811 14.3739C4.83226 14.3742 4.67332 14.4403 4.55625 14.5578C4.43918 14.6753 4.37358 14.8345 4.37387 15.0003C4.37416 15.1662 4.44033 15.3251 4.55781 15.4422C4.64219 15.5258 6.65469 17.5 10 17.5C12.9211 17.5 15.0414 15.75 16.25 14.3867V16.25C16.25 16.4158 16.3158 16.5747 16.4331 16.6919C16.5503 16.8092 16.7092 16.875 16.875 16.875C17.0408 16.875 17.1997 16.8092 17.3169 16.6919C17.4342 16.5747 17.5 16.4158 17.5 16.25V12.5C17.5 12.3342 17.4342 12.1753 17.3169 12.0581C17.1997 11.9408 17.0408 11.875 16.875 11.875Z"
			fill="#6A0BFF"
		/>
	</svg>
);

const CancelIcon = () => (
	<svg
		aria-hidden="true"
		className={styles.icon}
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M16.0675 15.1828C16.1256 15.2409 16.1717 15.3098 16.2031 15.3857C16.2345 15.4615 16.2507 15.5429 16.2507 15.625C16.2507 15.7071 16.2345 15.7884 16.2031 15.8643C16.1717 15.9402 16.1256 16.0091 16.0675 16.0672C16.0095 16.1252 15.9405 16.1713 15.8647 16.2027C15.7888 16.2342 15.7075 16.2503 15.6253 16.2503C15.5432 16.2503 15.4619 16.2342 15.386 16.2027C15.3102 16.1713 15.2412 16.1252 15.1832 16.0672L10.0003 10.8836L4.81753 16.0672C4.70026 16.1844 4.5412 16.2503 4.37535 16.2503C4.2095 16.2503 4.05044 16.1844 3.93316 16.0672C3.81588 15.9499 3.75 15.7908 3.75 15.625C3.75 15.4591 3.81588 15.3001 3.93316 15.1828L9.11675 9.99998L3.93316 4.81717C3.81588 4.69989 3.75 4.54083 3.75 4.37498C3.75 4.20913 3.81588 4.05007 3.93316 3.93279C4.05044 3.81552 4.2095 3.74963 4.37535 3.74963C4.5412 3.74963 4.70026 3.81552 4.81753 3.93279L10.0003 9.11639L15.1832 3.93279C15.3004 3.81552 15.4595 3.74963 15.6253 3.74963C15.7912 3.74963 15.9503 3.81552 16.0675 3.93279C16.1848 4.05007 16.2507 4.20913 16.2507 4.37498C16.2507 4.54083 16.1848 4.69989 16.0675 4.81717L10.8839 9.99998L16.0675 15.1828Z"
			fill="#6A0BFF"
		/>
	</svg>
);
