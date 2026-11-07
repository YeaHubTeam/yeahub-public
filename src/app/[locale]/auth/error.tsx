'use client';

import { Stub } from '@/shared/ui/Stub';

const AuthError = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => (
	<Stub type="error" onClick={reset} />
);

export default AuthError;
