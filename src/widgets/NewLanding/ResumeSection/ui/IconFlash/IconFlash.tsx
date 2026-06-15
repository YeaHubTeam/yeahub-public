import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';

import styles from './IconFlash.module.css';

const IconFlash = () => {
	return (
		<Flex className={styles.icon_flash_circle} align="center" justify="center">
			<Icon icon="lightning" color="purple-700" size={18} />
		</Flex>
	);
};

export default IconFlash;
