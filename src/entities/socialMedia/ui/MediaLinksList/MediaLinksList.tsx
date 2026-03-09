import { socialMediaLinks } from '../../model/constants/socialMedia';
import { MediaLinkItem } from '../MediaLinkItem/MediaLinkItem';
import styles from './MediaLinksList.module.css';

export const MediaLinksList = () => {
	return (
		<ul className={styles['links-list']}>
			{socialMediaLinks.map((channel) => (
				<MediaLinkItem channel={channel} key={channel.title} />
			))}
		</ul>
	);
};
