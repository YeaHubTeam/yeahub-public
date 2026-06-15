import classNames from 'classnames';

import styles from './Indicator.module.css';

interface IndicatorProps {
	className?: string;
	variant?: 'red' | 'purple';
}

export const Indicator = ({ className = '', variant = 'red' }: IndicatorProps) => {
	return <span className={classNames(styles.indicator, styles[variant], className)} />;
};
