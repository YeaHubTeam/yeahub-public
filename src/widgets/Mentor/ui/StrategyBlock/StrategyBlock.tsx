import { StrategyBlockHeader } from '../StrategyBlockHeader/StrategyBlockHeader';
import { StrategyBlockList } from '../StrategyBlockList/StrategyBlockList';
import styles from './StrategyBlock.module.css';

export const StrategyBlock = () => {
	return (
		<section className={styles['strategy-block']}>
			<StrategyBlockHeader />
			<StrategyBlockList />
		</section>
	);
};
