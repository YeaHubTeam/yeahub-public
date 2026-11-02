import { DeveloperStackIntro } from '../DeveloperStackIntro/DeveloperStackIntro';
import { DeveloperStackList } from '../DeveloperStackList/DeveloperStackList';
import styles from './DeveloperStackLayout.module.css';

export const DeveloperStackLayout = () => {
	return (
		<div className={styles.layout}>
			<DeveloperStackIntro />
			<DeveloperStackList />
		</div>
	);
};
