import { StaticImageData } from 'next/image';

import ciCdImg from '@/shared/assets/images/mentor/cicd.webp';
import css3Img from '@/shared/assets/images/mentor/css3.webp';
import dockerImg from '@/shared/assets/images/mentor/docker.webp';
import fsdImg from '@/shared/assets/images/mentor/fsd.webp';
import githubImg from '@/shared/assets/images/mentor/github.webp';
import html5Img from '@/shared/assets/images/mentor/html.webp';
import jsImg from '@/shared/assets/images/mentor/js.webp';
import kubernetesImg from '@/shared/assets/images/mentor/kubernetes.webp';
import n8nImg from '@/shared/assets/images/mentor/n8n.webp';
import nextImg from '@/shared/assets/images/mentor/next.webp';
import reactImg from '@/shared/assets/images/mentor/react.webp';
import reduxImg from '@/shared/assets/images/mentor/redux.webp';
import storybookImg from '@/shared/assets/images/mentor/storybook.webp';
import tsImg from '@/shared/assets/images/mentor/ts.webp';
import webpackImg from '@/shared/assets/images/mentor/webpack.webp';
import { Mentor } from '@/shared/config/i18n/i18nTranslations';

export interface TechItem {
	id: string;
	alt: string;
	src: StaticImageData;
}

export const MAIN_STACK: TechItem[][] = [
	[
		{ id: 'html5', alt: Mentor.STACK_HTML_IMAGE_ALT, src: html5Img },
		{ id: 'css3', alt: Mentor.STACK_CSS_IMAGE_ALT, src: css3Img },
		{ id: 'js', alt: Mentor.STACK_JS_IMAGE_ALT, src: jsImg },
		{ id: 'react', alt: Mentor.STACK_REACT_IMAGE_ALT, src: reactImg },
	],
	[
		{ id: 'redux', alt: Mentor.STACK_REDUX_IMAGE_ALT, src: reduxImg },
		{ id: 'ts', alt: Mentor.STACK_TS_IMAGE_ALT, src: tsImg },
		{ id: 'n8n', alt: Mentor.STACK_N8N_IMAGE_ALT, src: n8nImg },
		{ id: 'fsd', alt: Mentor.STACK_FSD_IMAGE_ALT, src: fsdImg },
		{ id: 'github', alt: Mentor.STACK_GITHUB_IMAGE_ALT, src: githubImg },
	],
];

export const ADVANCED_STACK: TechItem[][] = [
	[
		{ id: 'docker', alt: Mentor.STACK_DOCKER_IMAGE_ALT, src: dockerImg },
		{ id: 'kubernetes', alt: Mentor.STACK_KUBERNETES_IMAGE_ALT, src: kubernetesImg },
	],
	[
		{ id: 'ci-cd', alt: Mentor.STACK_CI_CD_IMAGE_ALT, src: ciCdImg },
		{ id: 'webpack', alt: Mentor.STACK_WEBPACK_IMAGE_ALT, src: webpackImg },
		{ id: 'storybook', alt: Mentor.STACK_STORYBOOK_IMAGE_ALT, src: storybookImg },
		{ id: 'nextjs', alt: Mentor.STACK_NEXT_IMAGE_ALT, src: nextImg },
	],
];
