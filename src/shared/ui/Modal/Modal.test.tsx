import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render as renderComponent, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server.node';
import ts from 'typescript';

import { Modal } from './Modal';
import type { ModalProps, ModalVariant, RequiredModalProps } from './ModalTypes';
import {
	closeIconColors,
	modalTestIds,
	outlineButtonVariants,
	primaryButtonVariants,
	titleColors,
} from './constants';

jest.mock('@/shared/ui/Icon', () => ({
	Icon: ({
		dataTestId,
		color,
		type: _type,
		icon: _icon,
		...props
	}: {
		dataTestId: string;
		color: string;
		type: string;
		icon: string;
	}) => <span {...props} data-testid={dataTestId} data-color={color} />,
}));
beforeEach(() => jest.clearAllMocks());

type OverrideProps = Partial<ModalProps>;

const onClose = jest.fn();

const render = (props: OverrideProps = {}) => {
	const defaultProps: RequiredModalProps = {
		isOpen: true,
		onClose,
	};
	renderComponent(
		<Modal {...defaultProps} {...props}>
			Modal Content
		</Modal>,
	);
};

describe('Modal', () => {
	describe('Rendering', () => {
		test('renders modal with required props', () => {
			render();

			expect(screen.getByTestId(modalTestIds.modal)).toBeInTheDocument();
			expect(screen.getByText('Modal Content')).toBeInTheDocument();
			expect(screen.getByTestId(modalTestIds.modalCloseIcon)).toBeInTheDocument();
			expect(screen.queryByTestId(modalTestIds.modalTitle)).not.toBeInTheDocument();
			expect(screen.queryByTestId(modalTestIds.modalPrimaryButton)).not.toBeInTheDocument();
			expect(screen.queryByTestId(modalTestIds.modalOutlineButton)).not.toBeInTheDocument();
		});

		test('renders with title', () => {
			render({ title: 'Modal Title' });

			expect(screen.getByTestId(modalTestIds.modalTitle)).toBeInTheDocument();
			expect(screen.getByText('Modal Title')).toBeInTheDocument();
		});

		test('render with primary button', () => {
			render({ buttonPrimaryText: 'Primary Text' });

			expect(screen.getByTestId(modalTestIds.modalPrimaryButton)).toBeInTheDocument();
			expect(screen.getByText('Primary Text')).toBeInTheDocument();
		});

		test('render with outline button', () => {
			render({ buttonOutlineText: 'Outline Text' });

			expect(screen.getByTestId(modalTestIds.modalOutlineButton)).toBeInTheDocument();
			expect(screen.getByText('Outline Text')).toBeInTheDocument();
		});

		test('render with primary and outline buttons', () => {
			render({
				buttonPrimaryText: 'Primary Text',
				buttonOutlineText: 'Outline Text',
			});

			expect(screen.getByTestId(modalTestIds.modalPrimaryButton)).toBeInTheDocument();
			expect(screen.getByText('Primary Text')).toBeInTheDocument();
			expect(screen.getByTestId(modalTestIds.modalOutlineButton)).toBeInTheDocument();
			expect(screen.getByText('Outline Text')).toBeInTheDocument();
		});

		test('close icon button should not be rendered when withCloseIcon is false', () => {
			render({ withCloseIcon: false });

			expect(screen.queryByTestId(modalTestIds.modalCloseIcon)).not.toBeInTheDocument();
		});

		test('merges custom className with internal classes', () => {
			render({ className: 'custom-class' });

			expect(screen.getByTestId(modalTestIds.modal)).toHaveClass('custom-class');
		});

		test.each<ModalVariant>(['default', 'error'])('renders %s variant correctly', (variant) => {
			render({
				title: 'Modal Title',
				variant: variant,
				buttonPrimaryText: 'Primary Text',
				buttonOutlineText: 'Outline Text',
			});

			expect(screen.getByTestId(modalTestIds.modal)).toHaveClass(`variant-${variant}-modal`);

			expect(screen.getByTestId(modalTestIds.modalTitle)).toHaveClass(
				`text-${titleColors[variant]}`,
			);
			expect(screen.getByTestId(modalTestIds.modalCloseIcon)).toHaveAttribute(
				'data-color',
				closeIconColors[variant],
			);
			expect(screen.getByTestId(modalTestIds.modalPrimaryButton)).toHaveClass(
				`button-${primaryButtonVariants[variant]}`,
			);
			expect(screen.getByTestId(modalTestIds.modalOutlineButton)).toHaveClass(
				`button-${outlineButtonVariants[variant]}`,
			);
		});

		test('sets overflow to hidden when modal is open', () => {
			render();

			expect(document.body.style.overflow).toBe('hidden');
			expect(screen.getByTestId(modalTestIds.modal)).toBeInTheDocument();
		});

		test('resets overflow when modal is closed', () => {
			render({ isOpen: false });

			expect(document.body.style.overflow).toBe('');
			expect(screen.queryByTestId(modalTestIds.modal)).not.toBeInTheDocument();
		});

		test('resets overflow on unmount when modal is open', () => {
			render();

			expect(document.body.style.overflow).toBe('hidden');

			cleanup();
			expect(document.body.style.overflow).toBe('');
		});
	});

	describe('Interactions', () => {
		const onPrimaryClick = jest.fn();
		const onOutlineClick = jest.fn();

		test('calls buttonPrimaryClick when primary button is clicked', () => {
			render({ buttonPrimaryText: 'Primary Text', buttonPrimaryClick: onPrimaryClick });

			fireEvent.click(screen.getByTestId(modalTestIds.modalPrimaryButton));
			expect(onPrimaryClick).toHaveBeenCalled();
		});

		test('calls buttonOutlineClick when outline button is clicked', () => {
			render({ buttonOutlineText: 'Outline Text', buttonOutlineClick: onOutlineClick });

			fireEvent.click(screen.getByTestId(modalTestIds.modalOutlineButton));
			expect(onOutlineClick).toHaveBeenCalled();
		});

		test('primary button should be disabled when buttonPrimaryDisabled is true', () => {
			render({
				buttonPrimaryText: 'Primary Text',
				buttonPrimaryDisabled: true,
			});

			expect(screen.getByTestId(modalTestIds.modalPrimaryButton)).toBeDisabled();
		});

		test('outline button should be disabled when buttonOutlineDisabled is true', () => {
			render({
				buttonOutlineText: 'Outline Text',
				buttonOutlineDisabled: true,
			});

			expect(screen.getByTestId(modalTestIds.modalOutlineButton)).toBeDisabled();
		});

		test('calls onClose when close icon button is clicked', () => {
			render();

			fireEvent.click(screen.getByTestId(modalTestIds.modalCloseIcon));
			expect(onClose).toHaveBeenCalled();
		});

		test('calls onClose when pressing Escape key', () => {
			render();

			fireEvent.keyDown(screen.getByTestId(modalTestIds.modalOverlay), { key: 'Escape' });
			expect(onClose).toHaveBeenCalled();
		});

		test('does not call onClose when pressing non-Escape key', () => {
			render();

			fireEvent.keyDown(screen.getByTestId(modalTestIds.modalOverlay), { key: 'Enter' });
			expect(onClose).not.toHaveBeenCalled();
		});

		test('calls onClose when clicking outside modal content (overlay)', () => {
			render();

			fireEvent.click(screen.getByTestId(modalTestIds.modalOverlay));
			expect(onClose).toHaveBeenCalled();
		});

		test('does not call onClose when clicking inside modal content', () => {
			render();

			fireEvent.click(screen.getByTestId(modalTestIds.modal));
			expect(onClose).not.toHaveBeenCalled();
		});
	});
});

describe('SSR and arbitrary content', () => {
	it('renders no portal on the server without DOM globals', () => {
		const source = readFileSync(`${process.cwd()}/src/shared/ui/Modal/Modal.tsx`, 'utf8');
		const compiled = ts.transpileModule(source, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				jsx: ts.JsxEmit.ReactJSX,
				esModuleInterop: true,
			},
		}).outputText;
		const isolated = { exports: {} as { Modal?: typeof Modal } };
		runInNewContext(compiled, {
			module: isolated,
			exports: isolated.exports,
			require: (name: string) =>
				name.startsWith('.')
					? name.endsWith('.css')
						? {}
						: jest.requireActual('./constants')
					: jest.requireActual(name),
		});
		const ServerModal = isolated.exports.Modal!;
		expect(
			renderToString(
				<ServerModal isOpen onClose={onClose}>
					<div>Server</div>
				</ServerModal>,
			),
		).toBe('');
	});
	it('hydrates the empty server snapshot and mounts the portal without mismatch', async () => {
		const error = jest.fn();
		const container = document.createElement('div');
		document.body.appendChild(container);
		const element = (
			<Modal isOpen onClose={onClose}>
				Hydrated content
			</Modal>
		);
		container.innerHTML = renderToString(element);
		let root: ReturnType<typeof hydrateRoot> | undefined;
		await act(async () => {
			root = hydrateRoot(container, element, { onRecoverableError: error });
			await Promise.resolve();
		});
		expect(screen.getByText('Hydrated content')).toBeInTheDocument();
		expect(error).not.toHaveBeenCalled();
		await act(async () => {
			root?.unmount();
			await Promise.resolve();
		});
		container.remove();
	});
	it('renders blocks, paragraphs and forms without paragraph nesting', () => {
		renderComponent(
			<Modal isOpen onClose={onClose}>
				<div>
					<p>Paragraph</p>
					<form>
						<input aria-label="Field" />
					</form>
				</div>
			</Modal>,
		);
		expect(screen.getByText('Paragraph').parentElement?.tagName).toBe('DIV');
		expect(document.querySelector('p p, p div, p form')).toBeNull();
		expect(screen.getByLabelText('Field')).toBeInTheDocument();
	});
	it('removes portal and restores previous scrolling state on unmount', () => {
		document.body.style.overflow = 'auto';
		const ui = renderComponent(
			<Modal isOpen onClose={onClose}>
				Content
			</Modal>,
		);
		const overlay = screen.getByTestId(modalTestIds.modalOverlay);
		ui.unmount();
		expect(document.getElementById('modal-root')).toBeNull();
		expect(document.body.style.overflow).toBe('auto');
		fireEvent.keyDown(document.body, { key: 'Escape' });
		expect(onClose).not.toHaveBeenCalled();
		expect(overlay.isConnected).toBe(false);
		document.body.style.overflow = '';
	});
});
