import { Metadata } from 'next';

import { LandingPage as LandingPageComponent } from '@/pages/LandingPage';

export const metadata: Metadata = {
	title: 'Landing',
	description: 'Лендинг страница',
};

const LandingPage = () => {
	return <LandingPageComponent />;
};

export default LandingPage;
