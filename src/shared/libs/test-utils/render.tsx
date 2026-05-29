import React, { PropsWithChildren } from 'react';

import { RenderOptions, render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const Providers = ({ children }: PropsWithChildren) => {
	return <>{children}</>;
};

export function render(ui: React.ReactElement, options?: RenderOptions) {
	return rtlRender(ui, { wrapper: Providers, ...options });
}

export * from '@testing-library/react';
export { userEvent };
