import { useTranslations } from 'next-intl';

import type { OwnProfile } from '@/entities/profile';
import { i18Namespace } from '@/shared/config';
import { StatusChip } from '@/shared/ui/StatusChip';
import type { StatusChipVariant } from '@/shared/ui/StatusChip';

import styles from './UserCard.module.css';

const roles: Record<string, { key: string; variant: StatusChipVariant }> = {
	candidate: { key: 'roles.candidate', variant: 'yellow' },
	'candidate-premium': { key: 'roles.candidatePremium', variant: 'yellow' },
	'candidate-free': { key: 'roles.candidateFree', variant: 'yellow' },
	HR: { key: 'roles.hr', variant: 'red' },
	author: { key: 'roles.author', variant: 'red' },
	guest: { key: 'roles.guest', variant: 'purple' },
	member: { key: 'roles.member', variant: 'purple' },
	admin: { key: 'roles.admin', variant: 'green' },
};

export const UserRoles = ({ userRoles }: Pick<OwnProfile, 'userRoles'>) => {
	const t = useTranslations(i18Namespace.profile);

	return (
		<div className={styles.roles}>
			{userRoles.map(({ id, name }) => {
				const role = Object.hasOwn(roles, name) ? roles[name] : undefined;
				return (
					<StatusChip
						key={id}
						status={{ text: role ? t(role.key) : name, variant: role?.variant ?? 'purple' }}
					/>
				);
			})}
		</div>
	);
};
