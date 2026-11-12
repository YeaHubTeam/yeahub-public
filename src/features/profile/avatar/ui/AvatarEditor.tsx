'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import 'cropperjs/dist/cropper.css';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Cropper } from 'react-cropper';
import type { ReactCropperElement } from 'react-cropper';

import { Translation, i18Namespace, useRouter } from '@/shared/config';
import { AvatarWithoutPhoto } from '@/shared/ui/AvatarWithoutPhoto';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Popover } from '@/shared/ui/Popover';
import { Text } from '@/shared/ui/Text';

import { MAX_AVATAR_BYTES, readAvatarFile } from '../lib/readAvatarFile';
import type { AvatarAction, AvatarActionInput } from '../model/types';
import styles from './AvatarEditor.module.css';

export const AvatarEditor = ({
	image,
	avatarAction,
}: {
	image: string | null;
	avatarAction: AvatarAction;
}) => {
	const t = useTranslations(i18Namespace.profile);
	const common = useTranslations(i18Namespace.translation);
	const router = useRouter();
	const { update } = useSession();
	const fileInput = useRef<HTMLInputElement>(null);
	const cropper = useRef<ReactCropperElement>(null);
	const mounted = useRef(false);
	const locked = useRef(false);
	const [pending, setPending] = useState(false);
	const [source, setSource] = useState<string | null>(null);
	const [cropped, setCropped] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<'success' | 'sync' | null>(null);
	const [confirmed, setConfirmed] = useState<{
		previous: string | null;
		value: string | null;
	} | null>(null);
	const visibleImage = confirmed?.previous === image ? confirmed.value : image;
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const choose = () => {
		if (!locked.current) fileInput.current?.click();
	};
	const select = async (file: File) => {
		if (locked.current) return;
		locked.current = true;
		setPending(true);
		setError(null);
		setNotice(null);
		try {
			const result = await readAvatarFile(file);
			if (!mounted.current) return;
			if (result.status !== 'success') {
				setError(t(`avatar.error.${result.status}`));
				return;
			}
			setCropped(null);
			setSource(result.source);
		} catch {
			if (mounted.current) setError(t('avatar.error.format'));
		} finally {
			locked.current = false;
			if (mounted.current) setPending(false);
		}
	};
	const crop = () => {
		try {
			const canvas = cropper.current?.cropper.getCroppedCanvas({
				minWidth: 128,
				minHeight: 128,
				maxWidth: 2048,
				maxHeight: 2048,
			});
			if (!canvas) return;
			const result = canvas.toDataURL('image/png');
			const encoded = result.replace(/^data:image\/png;base64,/, '');
			if (encoded.length > 4 * Math.ceil(MAX_AVATAR_BYTES / 3)) {
				setCropped(null);
				setError(t('avatar.error.size'));
				return;
			}
			setError(null);
			setCropped(result);
		} catch {
			setCropped(null);
			setError(t('avatar.error.format'));
		}
	};
	const close = () => {
		if (!locked.current) {
			setSource(null);
			setCropped(null);
			setError(null);
		}
	};
	const synchronize = async (repair: boolean) => {
		router.refresh();
		// A signal requests a server-verified read; no image or identity is sent by the client.
		return repair ? update({ syncAvatar: true }) : update();
	};
	const mutate = async (input: AvatarActionInput) => {
		if (locked.current) return;
		locked.current = true;
		setPending(true);
		setError(null);
		setNotice(null);
		try {
			const result = await avatarAction(input);
			if (!mounted.current) return;
			if (result.status !== 'success' && result.status !== 'sync-required') {
				setError(
					t(result.status === 'refresh-required' ? 'avatar.error.refresh' : 'avatar.error.general'),
				);
				return;
			}
			setSource(null);
			setCropped(null);
			if (result.status === 'success') setConfirmed({ previous: image, value: result.avatarUrl });
			try {
				const session = await synchronize(result.status === 'sync-required');
				if (!mounted.current) return;
				if (result.status === 'success' && session && session.user?.image === result.avatarUrl)
					setNotice('success');
				else setNotice('sync');
			} catch {
				if (mounted.current) setNotice('sync');
			}
		} catch {
			if (mounted.current) setError(t('avatar.error.general'));
		} finally {
			locked.current = false;
			if (mounted.current) setPending(false);
		}
	};
	const repair = async () => {
		if (locked.current) return;
		locked.current = true;
		setPending(true);
		try {
			await synchronize(true);
		} catch {
			/* Keep the explicit sync warning. */
		} finally {
			locked.current = false;
			if (mounted.current) setPending(false);
		}
	};
	const trigger = (toggle?: () => void) => (
		<button
			type="button"
			className={styles.trigger}
			disabled={pending}
			aria-busy={pending}
			aria-label={t(visibleImage ? 'avatar.change' : 'avatar.add')}
			onClick={visibleImage ? toggle : choose}
		>
			{visibleImage ? (
				<Image
					src={visibleImage}
					alt={common(Translation.AVATAR)}
					width={170}
					height={188}
					unoptimized
					className={styles.image}
				/>
			) : (
				<AvatarWithoutPhoto />
			)}
		</button>
	);

	return (
		<div className={styles.container}>
			<input
				ref={fileInput}
				type="file"
				accept="image/png,image/jpeg,image/avif"
				className={styles['file-input']}
				disabled={pending}
				aria-label={t('avatar.choose')}
				onChange={(event) => {
					const file = event.currentTarget.files?.[0];
					event.currentTarget.value = '';
					if (file) void select(file);
				}}
			/>
			<div
				className={styles.frame}
				onDragOver={(event) => event.preventDefault()}
				onDrop={(event) => {
					event.preventDefault();
					const file = event.dataTransfer.files[0];
					if (file) void select(file);
				}}
			>
				{visibleImage ? (
					<Popover
						ariaLabel={t('avatar.menu')}
						menuItems={[
							{
								renderComponent: (toggle) => (
									<Button
										type="button"
										variant="tertiary"
										disabled={pending}
										onClick={() => {
											toggle();
											choose();
										}}
									>
										{t('avatar.change')}
									</Button>
								),
							},
							{
								renderComponent: (toggle) => (
									<Button
										type="button"
										variant="destructive-tertiary"
										disabled={pending}
										onClick={() => {
											toggle();
											void mutate({ operation: 'delete' });
										}}
									>
										{t('avatar.delete')}
									</Button>
								),
							},
						]}
					>
						{({ onToggle }) => trigger(onToggle)}
					</Popover>
				) : (
					trigger()
				)}
			</div>
			{error && !source && (
				<div role="alert">
					<Text variant="body2" color="red-700">
						{error}
					</Text>
				</div>
			)}
			{notice && (
				<div role="status">
					<Text variant="body2">{t(notice === 'success' ? 'avatar.success' : 'avatar.sync')}</Text>
					{notice === 'sync' && (
						<Button
							type="button"
							variant="tertiary-link"
							disabled={pending}
							onClick={() => void repair()}
						>
							{t('avatar.reload')}
						</Button>
					)}
				</div>
			)}
			<Modal
				isOpen={source !== null}
				onClose={close}
				title={t('avatar.crop.title')}
				buttonPrimaryText={t('avatar.save')}
				buttonPrimaryDisabled={pending || !cropped}
				buttonPrimaryClick={() => {
					if (cropped)
						void mutate({
							operation: 'set',
							avatarImage: cropped.replace(/^data:image\/png;base64,/, ''),
						});
				}}
				buttonOutlineText={t('avatar.change')}
				buttonOutlineDisabled={pending}
				buttonOutlineClick={choose}
				withCloseIcon={!pending}
				className={styles.modal}
			>
				<Text variant="body3-accent">{t('avatar.crop.description')}</Text>
				<div className={styles['crop-layout']}>
					{source && (
						<Cropper
							ref={cropper}
							src={source}
							aspectRatio={1}
							viewMode={2}
							crop={crop}
							className={styles.cropper}
						/>
					)}
					<div className={styles.previews}>
						{cropped && (
							<>
								<Image
									src={cropped}
									alt={t('avatar.crop.large')}
									width={76}
									height={76}
									unoptimized
									className={styles.preview}
								/>
								<Image
									src={cropped}
									alt={t('avatar.crop.small')}
									width={26}
									height={26}
									unoptimized
									className={styles.preview}
								/>
							</>
						)}
					</div>
				</div>
				{error && (
					<div role="alert">
						<Text variant="body2" color="red-700">
							{error}
						</Text>
					</div>
				)}
				<Button type="button" variant="tertiary-link" disabled={pending} onClick={close}>
					{t('avatar.cancel')}
				</Button>
			</Modal>
		</div>
	);
};
