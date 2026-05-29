import React, { SVGProps } from 'react';

interface SvgMockProps extends SVGProps<SVGSVGElement> {
	dataTestId?: string;
}

const JestSvgMock = ({ dataTestId, ...props }: SvgMockProps) => (
	<svg data-testid={dataTestId} {...props} />
);

export default JestSvgMock;
