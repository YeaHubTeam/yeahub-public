import { useTranslations } from 'next-intl';

import type { ActiveProfile } from '@/entities/profile';
import { i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

import { safeExternalUrl } from '../lib/safeExternalUrl';
import styles from './UserCard.module.css';

const networks = {
	instagram: 'instagram',
	linkedin: 'linkedin',
	twitter: 'twitter',
	github: 'github',
	behance: 'behance',
	whatsapp: 'whatsapp',
	telegram: 'telegram',
	facebook: 'facebook',
	youtube: 'youtube',
} as const;

export const SocialLinks = ({ socialNetwork }: Pick<ActiveProfile, 'socialNetwork'>) => {
	const t = useTranslations(i18Namespace.profile);

	return (
		<div className={styles.socials}>
			{socialNetwork.map(({ code, title }, index) => {
				const href = safeExternalUrl(title);
				if (!href) return null;
				const icon = Object.hasOwn(networks, code)
					? networks[code as keyof typeof networks]
					: 'globe';
				return (
					<Button
						key={`${code}-${index}`}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						size="small"
						className={styles.social}
						aria-label={t('social.link', { name: code })}
					>
						<Icon icon={icon} className={styles['social-icon']} aria-hidden="true" />
					</Button>
				);
			})}
		</div>
	);
};
