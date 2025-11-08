import Image from 'next/image';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';

import { AvatarWithoutPhoto } from '../AvatarWithoutPhoto';
import styles from './Avatar.module.css';

interface AvatarProps {
	image?: string;
	size?: number;
	className?: string;
	borderRadius?: number;
	withBorder?: boolean;
}

export const Avatar = ({
	image,
	size = 50,
	borderRadius = 25,
	withBorder = false,
	className,
	...props
}: AvatarProps) => {
	const t = useTranslations(i18Namespace.translation);
	return (
		<div
			className={classNames(styles.wrapper, { [styles.border]: withBorder }, className)}
			style={{ width: size, height: size, borderRadius: borderRadius }}
			{...props}
		>
			{image ? (
				<Image
					width={100}
					height={100}
					className={styles.image}
					src={image}
					alt={t(Translation.AVATAR)}
				/>
			) : (
				<AvatarWithoutPhoto />
			)}
		</div>
	);
};
