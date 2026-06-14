import { Icon } from '@/shared/ui/Icon';

import styles from './IconFlash.module.css';

const IconFlash = () => {
	return (
		<div className={styles.icon_flash_circle}>
			<Icon icon="lightning" color="purple-700" size={18} />
		</div>
	);
};

export default IconFlash;
