import call from '@/shared/assets/images/call.webp';
import chart from '@/shared/assets/images/chart.webp';
import offer from '@/shared/assets/images/offerMessage.webp';
import platform from '@/shared/assets/images/platform.webp';
import resume from '@/shared/assets/images/resume.webp';
import { Mentor } from '@/shared/config';

export const EDUCATION_STEPS = [
	{
		id: '01',
		title: Mentor.EDUCATION_STEPS_01_TITLE,
		description: Mentor.EDUCATION_STEPS_01_DESCRIPTION,
		image: call,
		imgAlt: Mentor.EDUCATION_STEPS_01_IMAGE_ALT,
	},
	{
		id: '02',
		title: Mentor.EDUCATION_STEPS_02_TITLE,
		description: Mentor.EDUCATION_STEPS_02_DESCRIPTION,
	},
	{
		id: '03',
		title: Mentor.EDUCATION_STEPS_03_TITLE,
		description: Mentor.EDUCATION_STEPS_03_DESCRIPTION,
		image: offer,
		imgAlt: Mentor.EDUCATION_STEPS_03_IMAGE_ALT,
	},
	{
		id: '04',
		title: Mentor.EDUCATION_STEPS_04_TITLE,
		description: Mentor.EDUCATION_STEPS_04_DESCRIPTION,
	},
	{
		id: '05',
		title: Mentor.EDUCATION_STEPS_05_TITLE,
		description: Mentor.EDUCATION_STEPS_05_DESCRIPTION,
		image: chart,
		imgAlt: Mentor.EDUCATION_STEPS_05_IMAGE_ALT,
	},
	{
		id: '06',
		title: Mentor.EDUCATION_STEPS_06_TITLE,
		description: Mentor.EDUCATION_STEPS_06_DESCRIPTION,
	},
	{
		id: '07',
		title: Mentor.EDUCATION_STEPS_07_TITLE,
		description: Mentor.EDUCATION_STEPS_07_DESCRIPTION,
		image: platform,
		imgAlt: Mentor.EDUCATION_STEPS_07_IMAGE_ALT,
	},
	{
		id: '08',
		title: Mentor.EDUCATION_STEPS_08_TITLE,
		description: Mentor.EDUCATION_STEPS_08_DESCRIPTION,
	},
	{
		id: '09',
		title: Mentor.EDUCATION_STEPS_09_TITLE,
		description: Mentor.EDUCATION_STEPS_09_DESCRIPTION,
		image: resume,
		imgAlt: Mentor.EDUCATION_STEPS_09_IMAGE_ALT,
	},
];
