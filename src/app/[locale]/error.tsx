'use client';

import { useEffect } from 'react';

import { Stub } from '@/shared/ui/Stub';

import NotFound from './not-found';

interface ErrorBoundaryProps {
	error: Error & { digest?: string };
	reset: () => void;
}

const ErrorBoundary = ({ error, reset }: ErrorBoundaryProps) => {
	const handleTryAgain = () => {
		reset();
	};
	console.log(error);
	useEffect(() => {
		console.error(error);
	}, [error]);

	if (error.message.includes('404') || error.digest === 'NEXT_NOT_FOUND') {
		return <NotFound />;
	}

	return <Stub type="error" onClick={handleTryAgain} />;
};

export default ErrorBoundary;
