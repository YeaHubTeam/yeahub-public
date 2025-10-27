import { SocialMedia } from '../../model/types/socialMedia';
import { MediaLinkSimpleItem } from '../MediaLinkSimpleItem/MediaLinkSimpleItem';

interface MediaLinksBannerProps {
	mediaLink: SocialMedia;
}

export const MediaLinksBanner = ({ mediaLink }: MediaLinksBannerProps) => {
	return <MediaLinkSimpleItem mediaLink={mediaLink} />;
};
