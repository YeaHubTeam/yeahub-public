import CommunityHeader from '@/widgets/Mentor/CommunityBlock/ui/CommunityHeader/CommunityHeader';
import { CommunityList } from '@/widgets/Mentor/CommunityBlock/ui/CommunityList/CommunityList';

import styles from './CommunityBlock.module.css';

const CommunityBlock = () => {
	return (
		<section className={styles.root}>
			<CommunityHeader />
			<CommunityList />
		</section>
	);
};

export default CommunityBlock;
