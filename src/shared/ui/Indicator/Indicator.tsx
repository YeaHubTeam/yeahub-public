import classNames from 'classnames';

import styles from './Indicator.module.css';

interface IndicatorProps {
	className?: string;
}

export const Indicator = ({ className = '' }: IndicatorProps) => {
	return <span className={classNames(styles.indicator, className)} />;
};
