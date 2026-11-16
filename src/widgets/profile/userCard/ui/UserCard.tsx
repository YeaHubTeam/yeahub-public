import Image from 'next/image';

import { differenceInYears, isValid } from 'date-fns';
import { useTranslations } from 'next-intl';

import type { OwnProfile } from '@/entities/profile';
import { AvatarEditor } from '@/features/profile/avatar';
import type { AvatarAction } from '@/features/profile/avatar';
import DoubleCheck from '@/shared/assets/icons/doubleCheck.svg';
import Time from '@/shared/assets/icons/time.svg';
import { Link, ROUTES, Translation, i18Namespace } from '@/shared/config';
import { AvatarWithoutPhoto } from '@/shared/ui/AvatarWithoutPhoto';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { safeExternalUrl } from '../lib/safeExternalUrl';
import { SocialLinks } from './SocialLinks';
import styles from './UserCard.module.css';
import { UserRoles } from './UserRoles';

export interface UserCardProps {
	profile: OwnProfile;
	avatarAction?: AvatarAction;
	specialization: { id: number; title: string } | null;
}

export const UserCard = ({ profile, specialization, avatarAction }: UserCardProps) => {
	const t = useTranslations(i18Namespace.profile);
	const common = useTranslations(i18Namespace.translation);
	const birthday = profile.birthday ? new Date(profile.birthday) : null;
	const age = birthday && isValid(birthday) ? differenceInYears(new Date(), birthday) : null;
	const image = profile.avatarUrl ? safeExternalUrl(profile.avatarUrl) : null;
	const address = [profile.country, profile.city].filter((value) => value?.trim()).join(', ');
	const EmailIcon = profile.isVerified ? DoubleCheck : Time;

	return (
		<Card withOutsideShadow>
			<div className={styles.card}>
				<div className={styles['user-data']}>
					{avatarAction ? (
						<AvatarEditor image={image} avatarAction={avatarAction} />
					) : (
						<div className={styles.avatar}>
							{image ? (
								<Image
									src={image}
									alt={common(Translation.AVATAR)}
									width={170}
									height={188}
									unoptimized
									className={styles.image}
								/>
							) : (
								<AvatarWithoutPhoto />
							)}
						</div>
					)}
					<div className={styles.info}>
						<div className={styles.header}>
							<div className={styles.identity}>
								<Text variant="body6">{profile.username}</Text>
								<UserRoles userRoles={profile.userRoles} />
							</div>
							{age !== null && age >= 0 && (
								<Text variant="body3-accent">{t('age', { count: age })}</Text>
							)}
						</div>
						{specialization?.title.trim() && (
							<Text variant="body3-accent" color="black-800">
								{specialization.title}
							</Text>
						)}
						{address && (
							<Text variant="body2" color="black-500">
								{address}
							</Text>
						)}
						<div className={styles.contacts}>
							{profile.email.trim() && (
								<div className={styles.email}>
									<EmailIcon
										className={profile.isVerified ? styles.verified : styles.unverified}
										role="img"
										aria-label={t(profile.isVerified ? 'email.verified' : 'email.unverified')}
									/>
									<Text variant="body2" color={profile.isVerified ? 'black-700' : 'black-600'}>
										{profile.email}
									</Text>
								</div>
							)}
							{!profile.isVerified && (
								<Text variant="body2" color="black-600">
									{t('email.verify')}
								</Text>
							)}
							<SocialLinks socialNetwork={profile.activeProfile.socialNetwork} />
						</div>
					</div>
				</div>
				{avatarAction && (
					<Link
						href={`${ROUTES.profile.page}/edit#personal-information`}
						aria-label={t('edit.title')}
						className={styles.edit}
					>
						<Icon icon="pen" size={20} color="purple-700" aria-hidden="true" />
					</Link>
				)}
			</div>
		</Card>
	);
};
