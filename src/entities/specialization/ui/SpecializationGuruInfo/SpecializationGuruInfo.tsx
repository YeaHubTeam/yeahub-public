import { useTranslations } from 'next-intl';

import { Specializations, i18Namespace } from '@/shared/config';
import { Pallete } from '@/shared/libs';
import { Avatar } from '@/shared/ui/Avatar';
import { Flex } from '@/shared/ui/Flex';
import { Icon, IconName } from '@/shared/ui/Icon';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import { GuruInSpecialization } from '../../model/types/specialization';
import styles from './SpecializationGuruInfo.module.css';

interface SpecializationGuruInfoProps {
	guru: GuruInSpecialization;
	avatarSize: number;
	borderRadius: number;
	avatarIcon?: { icon: IconName; color?: Pallete };
}

export const SpecializationGuruInfo = ({
	guru,
	avatarSize,
	borderRadius,
	avatarIcon,
}: SpecializationGuruInfoProps) => {
	const { image, name, title } = guru;
	const chipTitle = title.split(' ')[0];
	const t = useTranslations(i18Namespace.specialization);
	return (
		<Flex direction="row" gap="16" className={styles.container}>
			<div className={styles['avatar-container']}>
				<Avatar
					size={avatarSize}
					image={image}
					borderRadius={borderRadius}
					withBorder
					className={styles.avatar}
				/>
				{avatarIcon && (
					<Icon
						icon={avatarIcon.icon}
						color={avatarIcon.color || 'purple-700'}
						className={styles['avatar-badge']}
					/>
				)}
			</div>
			<Flex direction="column" gap="8">
				<StatusChip
					status={{
						text: t(Specializations.GURU_CHIP_TITILE, {
							specialization: chipTitle,
						}),
						variant: 'green',
					}}
				/>
				<Flex direction="column" gap="8">
					<Text variant="body5-accent" color="black-900" className={styles['guru-name']}>
						{name}
					</Text>
					<Text variant="body3" color="black-800" className={styles['guru-description']}>
						{title} {t(Specializations.GURU_TITILE_SUFFIX)}
					</Text>
				</Flex>
			</Flex>
		</Flex>
	);
};
