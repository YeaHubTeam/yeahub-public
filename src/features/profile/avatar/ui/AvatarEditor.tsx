'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import 'cropperjs/dist/cropper.css';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Cropper } from 'react-cropper';
import type { ReactCropperElement } from 'react-cropper';

import { useAvatarState } from '@/entities/profile';
import Gallery from '@/shared/assets/images/gallery.avif';
import { Translation, i18Namespace } from '@/shared/config';
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
	variant = 'default',
}: {
	image: string | null;
	avatarAction: AvatarAction;
	variant?: 'default' | 'profile-edit';
}) => {
	const t = useTranslations(i18Namespace.profile);
	const common = useTranslations(i18Namespace.translation);
	const { data: sessionData, status: sessionStatus } = useSession();
	const owner = sessionData?.user?.id;
	const currentOwner = useRef(owner);
	const generation = useRef(0);
	const { value, beginChange } = useAvatarState();
	const fileInput = useRef<HTMLInputElement>(null);
	const cropper = useRef<ReactCropperElement>(null);
	const mounted = useRef(false);
	const locked = useRef(false);
	const [pending, setPending] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [source, setSource] = useState<string | null>(null);
	const [cropped, setCropped] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const visibleImage = value && value.userId === owner ? value.avatarUrl : image;
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	useEffect(() => {
		currentOwner.current = owner;
	}, [owner]);

	const choose = () => {
		if (!locked.current) fileInput.current?.click();
	};
	const select = async (file: File) => {
		if (locked.current) return;
		locked.current = true;
		setPending(true);
		setError(null);
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
	const mutate = async (input: AvatarActionInput) => {
		if (locked.current) return;
		const userId = currentOwner.current;
		if (!userId || sessionStatus !== 'authenticated') {
			return;
		}
		const id = ++generation.current;
		const publish = beginChange(userId);
		locked.current = true;
		setPending(true);
		setError(null);
		try {
			const result = await avatarAction(input);
			if (!mounted.current || generation.current !== id || currentOwner.current !== userId) return;
			if (result.status !== 'success') {
				setError(
					t(result.status === 'refresh-required' ? 'avatar.error.refresh' : 'avatar.error.general'),
				);
				return;
			}
			setSource(null);
			setCropped(null);
			if (!publish(result.avatarUrl)) return;
		} catch {
			if (mounted.current && generation.current === id) setError(t('avatar.error.general'));
		} finally {
			if (generation.current === id) {
				locked.current = false;
				if (mounted.current) setPending(false);
			}
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
			{visibleImage && failedImage !== visibleImage ? (
				<Image
					src={visibleImage}
					onError={() => setFailedImage(visibleImage)}
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
		<div className={variant === 'profile-edit' ? styles['edit-container'] : styles.container}>
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
			{variant === 'profile-edit' ? (
				<div className={styles['edit-layout']}>
					<div className={styles['edit-preview']}>
						<div className={styles['edit-picture']} aria-busy={pending}>
							{visibleImage && failedImage !== visibleImage ? (
								<Image
									src={visibleImage}
									onError={() => setFailedImage(visibleImage)}
									alt={t('avatar.upload.preview')}
									width={170}
									height={188}
									unoptimized
									className={styles['edit-image']}
								/>
							) : (
								<AvatarWithoutPhoto />
							)}
						</div>
						{visibleImage && (
							<Button
								type="button"
								fullWidth
								variant="destructive-tertiary"
								disabled={pending}
								aria-busy={pending}
								className={styles['edit-delete']}
								onClick={() => void mutate({ operation: 'delete' })}
							>
								{t('avatar.upload.delete')}
							</Button>
						)}
					</div>
					<div
						className={`${styles['upload-zone']} ${dragActive ? styles['upload-active'] : ''} ${pending ? styles['upload-disabled'] : ''}`}
						role="button"
						tabIndex={pending ? -1 : 0}
						aria-label={t('avatar.choose')}
						aria-disabled={pending}
						aria-busy={pending}
						onClick={choose}
						onKeyDown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								choose();
							}
						}}
						onDragEnter={(event) => {
							event.preventDefault();
							if (!locked.current) setDragActive(true);
						}}
						onDragOver={(event) => {
							event.preventDefault();
							if (!locked.current) setDragActive(true);
						}}
						onDragLeave={(event) => {
							if (
								!(event.relatedTarget instanceof Node) ||
								!event.currentTarget.contains(event.relatedTarget)
							)
								setDragActive(false);
						}}
						onDrop={(event) => {
							event.preventDefault();
							setDragActive(false);
							const file = event.dataTransfer.files[0];
							if (file) void select(file);
						}}
					>
						<Image
							src={Gallery}
							alt={t('avatar.upload.photo')}
							width={32}
							height={33}
							unoptimized
						/>
						<div className={styles['upload-instruction']}>
							<Text variant="body2" color="purple-700" isNoWrap>
								{t('avatar.upload.link')}
							</Text>
							<Text variant="body2" color="black-500" isNoWrap>
								{t('avatar.upload.text')} {t('avatar.upload.photo')}
							</Text>
						</div>
						<Text variant="body1" color="black-300">
							{t('avatar.upload.formats')} (
							{t('avatar.upload.limit', { maxFileMBSize: MAX_AVATAR_BYTES / (1024 * 1024) })})
						</Text>
					</div>
				</div>
			) : (
				<>
					<div
						className={styles.frame}
						onDragOver={(event) => event.preventDefault()}
						onDrop={(event) => {
							event.preventDefault();
							const file = event.dataTransfer.files[0];
							if (file) void select(file);
						}}
					>
						{visibleImage && failedImage !== visibleImage ? (
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
				</>
			)}
			{error && !source && (
				<div role="alert">
					<Text variant="body2" color="red-700">
						{error}
					</Text>
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
