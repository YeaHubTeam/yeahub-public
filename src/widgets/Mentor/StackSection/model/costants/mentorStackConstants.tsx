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

export interface TechItem {
	id: string;
	alt: string;
	src: StaticImageData;
}

export const MAIN_STACK: TechItem[][] = [
	[
		{ id: 'html5', alt: 'HTML5', src: html5Img },
		{ id: 'css3', alt: 'CSS3', src: css3Img },
		{ id: 'js', alt: 'JavaScript', src: jsImg },
		{ id: 'react', alt: 'React', src: reactImg },
	],
	[
		{ id: 'redux', alt: 'Redux', src: reduxImg },
		{ id: 'ts', alt: 'TypeScript', src: tsImg },
		{ id: 'n8n', alt: 'n8n', src: n8nImg },
		{ id: 'fsd', alt: 'FSD', src: fsdImg },
		{ id: 'github', alt: 'GitHub', src: githubImg },
	],
];

export const ADVANCED_STACK: TechItem[][] = [
	[
		{ id: 'docker', alt: 'Docker', src: dockerImg },
		{ id: 'kubernetes', alt: 'Kubernetes', src: kubernetesImg },
	],
	[
		{ id: 'ci-cd', alt: 'CI/CD', src: ciCdImg },
		{ id: 'webpack', alt: 'Webpack', src: webpackImg },
		{ id: 'storybook', alt: 'Storybook', src: storybookImg },
		{ id: 'nextjs', alt: 'Next.js', src: nextImg },
	],
];
