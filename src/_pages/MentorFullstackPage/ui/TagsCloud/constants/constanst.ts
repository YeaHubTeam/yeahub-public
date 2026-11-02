import { MentorFullstack } from '@/shared/config';

const tagsCloudTitles = [
	MentorFullstack.TAGS_CLOUD_JAVASCRIPT,
	MentorFullstack.TAGS_CLOUD_HTML,
	MentorFullstack.TAGS_CLOUD_REACT,
	MentorFullstack.TAGS_CLOUD_PYTHON,
	MentorFullstack.TAGS_CLOUD_SWIFT,
	MentorFullstack.TAGS_CLOUD_CSS,
	MentorFullstack.TAGS_CLOUD_REACT,
	MentorFullstack.TAGS_CLOUD_JAVASCRIPT,
	MentorFullstack.TAGS_CLOUD_REACT,
	MentorFullstack.TAGS_CLOUD_JAVASCRIPT,
	MentorFullstack.TAGS_CLOUD_PYTHON,
	MentorFullstack.TAGS_CLOUD_SWIFT,
	MentorFullstack.TAGS_CLOUD_PYTHON,
	MentorFullstack.TAGS_CLOUD_SWIFT,
	MentorFullstack.TAGS_CLOUD_HTML,
];

export const tagsCloudList = tagsCloudTitles.map((title, index) => ({
	id: String(index),
	title,
}));

export const tagsCloudSliderSettings = {
	slidesToShow: 5,
	slidesToScroll: 2,
};
