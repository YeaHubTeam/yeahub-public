'use client';

import React from 'react';

import Image, { StaticImageData } from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import AccessDeniedImg from '@/shared/assets/images/accessDenied.png';
import LoadError from '@/shared/assets/images/loadError.png';
import FilterEmptyImg from '@/shared/assets/images/notFound.avif';
import SearchImg from '@/shared/assets/images/searchPage.png';
import { Translation, i18Namespace } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './Stub.module.css';

type StubType = 'empty' | 'error' | 'access-denied' | 'filter-empty';

type StubProps = {
	type: StubType;
	title?: string;
	subtitle?: string;
	buttonText?: string;
	className?: string;
	onClick?: () => void;
};

export const Stub = ({ type, title, subtitle, buttonText, className, onClick }: StubProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations(i18Namespace.translation);

	const { isMobile } = useScreenSize();

	const titleVariant = isMobile ? 'body3-strong' : 'body4';

	const titleByType: Record<StubType, string> = {
		error: t(Translation.STUB_ERROR_TITLE),
		empty: '',
		'access-denied': t(Translation.ACCESS_DENIED_TITLE),
		'filter-empty': t(Translation.STUB_FILTER_TITLE),
	};

	const subtitleByType: Record<StubType, string> = {
		error: t(Translation.STUB_ERROR_SUBTITLE),
		empty: '',
		'access-denied': t(Translation.ACCESS_DENIED_DESCRIPTION),
		'filter-empty': t(Translation.STUB_FILTER_SUBTITLE),
	};

	const buttonTextByType: Record<StubType, string> = {
		error: t(Translation.STUB_ERROR_SUBMIT),
		empty: '',
		'access-denied': t(Translation.ACCESS_DENIED_BUTTON),
		'filter-empty': t(Translation.RESET_FILTERS),
	};

	const imgByType: Record<StubType, StaticImageData> = {
		empty: SearchImg,
		error: LoadError,
		'access-denied': AccessDeniedImg,
		'filter-empty': FilterEmptyImg,
	};

	const resolvedTitle = title ?? titleByType[type];
	const resolvedSubtitle = subtitle ?? subtitleByType[type];
	const resolvedButtonText = buttonText ?? buttonTextByType[type];
	const resolvedButtonType = type === 'filter-empty' ? 'outline' : 'primary';

	const handleClick = () => {
		if (onClick) {
			onClick();
			return;
		}

		if (type === 'empty') {
			router.back();
			return;
		}

		if (type === 'filter-empty') {
			if (pathname) {
				router.replace(pathname, { scroll: false });
			}
			return;
		}

		return;
	};

	return (
		<Card withOutsideShadow className={classNames(styles.wrapper, className)}>
			<Flex gap="20" justify="between" align="center" direction="column">
				<Image src={imgByType[type]} alt="" loading="lazy" className={styles.img} height={186} />

				{(resolvedTitle || resolvedSubtitle) && (
					<Flex gap="6" align="center" direction="column">
						{Boolean(resolvedTitle) && <Text variant={titleVariant}>{resolvedTitle}</Text>}
						{Boolean(resolvedSubtitle) && <Text variant="body3">{resolvedSubtitle}</Text>}
					</Flex>
				)}

				{Boolean(resolvedButtonText) && (
					<Button
						size="large"
						variant={resolvedButtonType}
						onClick={handleClick}
						disabled={!handleClick}
						className={styles.button}
					>
						{resolvedButtonText}
					</Button>
				)}
			</Flex>
		</Card>
	);
};
