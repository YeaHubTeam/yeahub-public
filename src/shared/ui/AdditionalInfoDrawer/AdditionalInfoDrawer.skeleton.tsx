import { IconButtonSkeleton } from '@/shared/ui/IconButton';

import styles from './AdditionalInfoDrawer.module.css';

export const AdditionalInfoDrawerSkeleton = () => {
	return (
		<div className={styles['popover-additional']}>
			<IconButtonSkeleton role="status" form="square" size="medium" variant="tertiary" />
		</div>
	);
};
