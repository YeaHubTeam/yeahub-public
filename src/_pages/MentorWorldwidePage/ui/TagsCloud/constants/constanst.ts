import { MentorWorldwide } from '@/shared/config';

const tagsCloudTitles = [
	MentorWorldwide.TAGS_CLOUD_JAVASCRIPT,
	MentorWorldwide.TAGS_CLOUD_HTML,
	MentorWorldwide.TAGS_CLOUD_REACT,
	MentorWorldwide.TAGS_CLOUD_PYTHON,
	MentorWorldwide.TAGS_CLOUD_SWIFT,
	MentorWorldwide.TAGS_CLOUD_CSS,
	MentorWorldwide.TAGS_CLOUD_REACT,
	MentorWorldwide.TAGS_CLOUD_JAVASCRIPT,
	MentorWorldwide.TAGS_CLOUD_REACT,
	MentorWorldwide.TAGS_CLOUD_JAVASCRIPT,
	MentorWorldwide.TAGS_CLOUD_PYTHON,
	MentorWorldwide.TAGS_CLOUD_SWIFT,
	MentorWorldwide.TAGS_CLOUD_PYTHON,
	MentorWorldwide.TAGS_CLOUD_SWIFT,
	MentorWorldwide.TAGS_CLOUD_HTML,
];

export const tagsCloudList = tagsCloudTitles.map((title, index) => ({
	id: String(index),
	title,
}));

export const tagsCloudSliderSettings = {
	slidesToShow: 5,
	slidesToScroll: 2,
};
