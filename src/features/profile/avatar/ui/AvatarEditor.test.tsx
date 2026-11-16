import type { ReactElement } from 'react';

import '@testing-library/jest-dom';
import { act, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToString } from 'react-dom/server';

import { AvatarStateProvider } from '@/entities/profile';

import { AvatarEditor } from '../index';
import type { AvatarActionResult } from '../model/types';

const render = (ui: ReactElement) =>
	rtlRender(ui, {
		wrapper: ({ children }) => <AvatarStateProvider userId="user">{children}</AvatarStateProvider>,
	});
const refresh = jest.fn();
const update = jest.fn();
const getSession = jest.fn();
const canvas = jest.fn();
const cropped = 'data:image/png;base64,cG5n';
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { profile: 'profile', translation: 'translation' },
	useRouter: () => ({ refresh }),
}));
let sessionStatus: 'authenticated' | 'loading' | 'unauthenticated' = 'authenticated';
let sessionOwner = 'user';
let sessionImage: string | null | undefined;
jest.mock('next-auth/react', () => ({
	getSession: () => getSession(),
	useSession: () => ({
		update,
		status: sessionStatus,
		data: sessionOwner ? { user: { id: sessionOwner, image: sessionImage } } : null,
	}),
}));
jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));
jest.mock('react-cropper', () => {
	const React = jest.requireActual<typeof import('react')>('react');
	const Mock = React.forwardRef<
		unknown,
		{ src: string; crop: () => void; aspectRatio: number; viewMode: number }
	>(({ src, crop, aspectRatio, viewMode }, ref) => {
		React.useImperativeHandle(ref, () => ({ cropper: { getCroppedCanvas: canvas } }));
		const previous = React.useRef('');
		React.useEffect(() => {
			if (previous.current !== src) {
				previous.current = src;
				crop();
			}
		}, [src, crop]);
		return <div data-testid="cropper" data-aspect={aspectRatio} data-view={viewMode} />;
	});
	Mock.displayName = 'Cropper';
	return { Cropper: Mock };
});
const action = jest.fn<
	Promise<AvatarActionResult>,
	[Parameters<import('../model/types').AvatarAction>[0]]
>();
const oldImage = 'https://images.example/old.png';
const newImage = 'https://images.example/new.png';
beforeEach(() => {
	sessionStatus = 'authenticated';
	sessionOwner = 'user';
	sessionImage = undefined;
	action.mockReset();
	action.mockResolvedValue({ status: 'success', avatarUrl: newImage });
	refresh.mockReset();
	update.mockReset();
	getSession.mockReset();
	getSession.mockImplementation(() => {
		sessionImage = newImage;
		return Promise.resolve(null);
	});
	update.mockResolvedValue({ user: { id: 'user', image: newImage } });
	canvas.mockReset();
	canvas.mockReturnValue({ toDataURL: () => cropped });
	jest.spyOn(window, 'Image').mockImplementation(() => {
		const image = document.createElement('img');
		Object.defineProperty(image, 'naturalWidth', { value: 512 });
		Object.defineProperty(image, 'naturalHeight', { value: 512 });
		Object.defineProperty(image, 'src', {
			set: () => queueMicrotask(() => image.dispatchEvent(new Event('load'))),
		});
		return image;
	});
});
afterEach(() => jest.restoreAllMocks());
const select = async (container: HTMLElement) => {
	fireEvent.change(container.querySelector('input')!, {
		target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] },
	});
	await screen.findByTestId('cropper');
	await waitFor(() =>
		expect(screen.getByRole('button', { name: 'Сохранить изменения' })).toBeEnabled(),
	);
};
it('opens the original square crop with two previews and cancels without mutation', async () => {
	const { container } = render(<AvatarEditor image={null} avatarAction={action} />);
	await select(container);
	expect(screen.getByTestId('cropper')).toHaveAttribute('data-aspect', '1');
	expect(screen.getByTestId('cropper')).toHaveAttribute('data-view', '2');
	expect(screen.getByRole('img', { name: 'Большой размер превью аватара' })).toBeInTheDocument();
	expect(screen.getByRole('img', { name: 'Маленький размер превью аватара' })).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
	expect(screen.queryByTestId('cropper')).not.toBeInTheDocument();
	expect(action).not.toHaveBeenCalled();
});
it.each([null, oldImage])(
	'adds or replaces and synchronizes the card and Header %#',
	async (image) => {
		const { container } = render(<AvatarEditor image={image} avatarAction={action} />);
		await select(container);
		fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));
		await waitFor(() =>
			expect(screen.getByRole('img', { name: 'Аватар' })).toHaveAttribute('src', newImage),
		);
		expect(screen.queryByRole('status')).toBeNull();
		expect(screen.queryByText('Фотография профиля обновлена.')).toBeNull();
		expect(action).toHaveBeenCalledWith({ operation: 'set', avatarImage: 'cG5n' });
		expect(refresh).not.toHaveBeenCalled();
		expect(getSession).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
		expect(screen.getByRole('img', { name: 'Аватар' })).toHaveAttribute('src', newImage);
	},
);
it('deletes through the real Popover and restores the fallback', async () => {
	action.mockResolvedValue({ status: 'success', avatarUrl: null });
	getSession.mockImplementation(() => {
		sessionImage = null;
		return Promise.resolve(null);
	});
	render(<AvatarEditor image={oldImage} avatarAction={action} />);
	fireEvent.click(screen.getByRole('button', { name: 'Обновить фотографию' }));
	fireEvent.click(await screen.findByRole('button', { name: 'Удалить фотографию' }));
	await screen.findByTestId('AvatarWithoutPhoto_Wrapper');
	expect(screen.queryByRole('status')).toBeNull();
	expect(screen.queryByText('Фотография профиля обновлена.')).toBeNull();
	expect(action).toHaveBeenCalledWith({ operation: 'delete' });
	expect(screen.getByTestId('AvatarWithoutPhoto_Wrapper')).toBeInTheDocument();
});
it('blocks duplicate submission throughout pending', async () => {
	let finish: ((value: AvatarActionResult) => void) | undefined;
	action.mockImplementation(
		() =>
			new Promise((resolve) => {
				finish = resolve;
			}),
	);
	const { container } = render(<AvatarEditor image={null} avatarAction={action} />);
	await select(container);
	const save = screen.getByRole('button', { name: 'Сохранить изменения' });
	fireEvent.click(save);
	fireEvent.click(save);
	expect(save).toBeDisabled();
	expect(action).toHaveBeenCalledTimes(1);
	await act(async () => {
		finish?.({ status: 'success', avatarUrl: newImage });
		await Promise.resolve();
	});
});
it.each(['error', 'rejection'])('preserves the old image on %s and allows retry', async (kind) => {
	if (kind === 'rejection') action.mockRejectedValue(new Error('hidden diagnostic'));
	else action.mockResolvedValue({ status: 'error' });
	const { container } = render(<AvatarEditor image={oldImage} avatarAction={action} />);
	await select(container);
	fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));
	await screen.findByText('Не удалось изменить фотографию. Попробуйте ещё раз.');
	expect(screen.getByRole('img', { name: 'Аватар' })).toHaveAttribute('src', oldImage);
	expect(screen.getByRole('button', { name: 'Сохранить изменения' })).toBeEnabled();
	expect(refresh).not.toHaveBeenCalled();
	expect(update).not.toHaveBeenCalled();
});
it('does not update UI after unmounting during a request', async () => {
	let finish: ((value: AvatarActionResult) => void) | undefined;
	action.mockImplementation(
		() =>
			new Promise((resolve) => {
				finish = resolve;
			}),
	);
	const { container, unmount } = render(<AvatarEditor image={null} avatarAction={action} />);
	await select(container);
	fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));
	unmount();
	await act(async () => {
		finish?.({ status: 'success', avatarUrl: newImage });
		await Promise.resolve();
	});
	expect(refresh).not.toHaveBeenCalled();
	expect(update).not.toHaveBeenCalled();
});
it('has a safe initial SSR render without opening a portal or invoking actions', () => {
	expect(renderToString(<AvatarEditor image={null} avatarAction={action} />)).toContain(
		'Добавить фотографию',
	);
	expect(action).not.toHaveBeenCalled();
});

describe('profile-edit variant', () => {
	const show = (image: string | null = oldImage) =>
		render(<AvatarEditor image={image} avatarAction={action} variant="profile-edit" />);
	it('keeps default and explicit default identical, without an upload panel', () => {
		const { container, rerender } = render(<AvatarEditor image={oldImage} avatarAction={action} />);
		const initial = container.innerHTML;
		rerender(<AvatarEditor image={oldImage} avatarAction={action} variant="default" />);
		expect(container.innerHTML).toBe(initial);
		expect(screen.queryByText('Кликни для изменения')).not.toBeInTheDocument();
	});
	it('renders the original illustration, separate uploader, preview and visible delete action without a Popover', () => {
		const { container } = show();
		expect(screen.getByRole('img', { name: 'Фото профиля' })).toHaveAttribute('width', '170');
		expect(screen.getByRole('img', { name: 'Фото профиля' })).toHaveAttribute('height', '188');
		expect(screen.getByRole('img', { name: 'фото' })).toHaveAttribute('width', '32');
		expect(screen.getByRole('img', { name: 'фото' })).toHaveAttribute('height', '33');
		expect(screen.getByText('Кликни для изменения')).toBeInTheDocument();
		expect(screen.getByText('или перетащи сюда фото')).toBeInTheDocument();
		expect(screen.getByText('JPG,PNG,JPEG,AVIF (не более 5мб)')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Удалить фото' })).toBeVisible();
		expect(screen.queryByRole('button', { name: 'Обновить фотографию' })).not.toBeInTheDocument();
		expect(container.querySelectorAll('input[type="file"]')).toHaveLength(1);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});
	it('shows the fallback and no delete action when the avatar is absent', () => {
		show(null);
		expect(screen.getByTestId('AvatarWithoutPhoto_Wrapper')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Удалить фото' })).not.toBeInTheDocument();
	});
	it('opens the one existing input on click, Enter and Space', () => {
		const { container } = show();
		const input = container.querySelector('input')!;
		const click = jest.spyOn(input, 'click');
		const uploader = screen.getByRole('button', { name: 'Выберите фотографию' });
		fireEvent.click(uploader);
		fireEvent.keyDown(uploader, { key: 'Enter' });
		fireEvent.keyDown(uploader, { key: ' ' });
		expect(click).toHaveBeenCalledTimes(3);
		expect(action).not.toHaveBeenCalled();
	});
	it('uses the shared validation and shows an unsupported file error without crop or action', async () => {
		const { container } = show();
		fireEvent.change(container.querySelector('input')!, {
			target: { files: [new File(['text'], 'image.svg', { type: 'image/svg+xml' })] },
		});
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Выберите корректное изображение PNG, JPEG или AVIF.',
		);
		expect(screen.queryByTestId('cropper')).not.toBeInTheDocument();
		expect(action).not.toHaveBeenCalled();
	});
	it('uses the existing crop, previews and mutation once for a chosen file', async () => {
		const { container } = show();
		await select(container);
		expect(screen.getByTestId('cropper')).toHaveAttribute('data-aspect', '1');
		expect(screen.getByRole('img', { name: 'Большой размер превью аватара' })).toBeInTheDocument();
		expect(
			screen.getByRole('img', { name: 'Маленький размер превью аватара' }),
		).toBeInTheDocument();
		fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));
		await waitFor(() =>
			expect(screen.getByRole('img', { name: 'Фото профиля' })).toHaveAttribute('src', newImage),
		);
		expect(screen.queryByRole('status')).toBeNull();
		expect(screen.queryByText('Фотография профиля обновлена.')).toBeNull();
		expect(action).toHaveBeenCalledTimes(1);
		expect(action).toHaveBeenCalledWith({ operation: 'set', avatarImage: 'cG5n' });
		expect(screen.getByRole('img', { name: 'Фото профиля' })).toHaveAttribute('src', newImage);
	});
	it('routes drag-and-drop to the same validation and crop', async () => {
		show();
		const uploader = screen.getByRole('button', { name: 'Выберите фотографию' });
		fireEvent.dragEnter(uploader);
		expect(uploader).toHaveClass('upload-active');
		fireEvent.drop(uploader, {
			dataTransfer: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] },
		});
		await screen.findByTestId('cropper');
		expect(uploader).not.toHaveClass('upload-active');
		expect(action).not.toHaveBeenCalled();
	});
	it('uses the existing delete action and blocks upload and repeated deletion while pending', async () => {
		let finish: (value: AvatarActionResult) => void = () => {};
		action.mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		const { container } = show();
		const inputClick = jest.spyOn(container.querySelector('input')!, 'click');
		const remove = screen.getByRole('button', { name: 'Удалить фото' });
		const uploader = screen.getByRole('button', { name: 'Выберите фотографию' });
		fireEvent.click(remove);
		fireEvent.click(remove);
		fireEvent.click(uploader);
		fireEvent.keyDown(uploader, { key: 'Enter' });
		expect(remove).toBeDisabled();
		expect(uploader).toHaveAttribute('aria-disabled', 'true');
		expect(inputClick).not.toHaveBeenCalled();
		expect(action).toHaveBeenCalledTimes(1);
		expect(action).toHaveBeenCalledWith({ operation: 'delete' });
		getSession.mockImplementation(() => {
			sessionImage = null;
			return Promise.resolve(null);
		});
		await act(async () => {
			finish({ status: 'success', avatarUrl: null });
			await Promise.resolve();
		});
		expect(screen.getByTestId('AvatarWithoutPhoto_Wrapper')).toBeInTheDocument();
	});
	it.each(['error', 'rejection'])('keeps the preview after delete %s', async (outcome) => {
		if (outcome === 'error') action.mockResolvedValue({ status: 'error' });
		else action.mockRejectedValue(new Error('private details'));
		show();
		fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Не удалось изменить фотографию. Попробуйте ещё раз.',
		);
		expect(screen.getByRole('img', { name: 'Фото профиля' })).toHaveAttribute('src', oldImage);
		expect(screen.getByRole('button', { name: 'Удалить фото' })).toBeEnabled();
	});
	it('does not retain edit-only controls when switched back to default', () => {
		const { rerender } = show();
		rerender(<AvatarEditor image={oldImage} avatarAction={action} />);
		expect(screen.queryByText('Кликни для изменения')).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Удалить фото' })).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Обновить фотографию' })).toBeInTheDocument();
	});
});

it('profile-edit rejects a file above the unchanged 5 MiB limit without mutation', async () => {
	const { container } = render(
		<AvatarEditor image={null} avatarAction={action} variant="profile-edit" />,
	);
	fireEvent.change(container.querySelector('input')!, {
		target: {
			files: [new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })],
		},
	});
	expect(await screen.findByRole('alert')).toHaveTextContent(
		'Размер изображения не должен превышать 5 МиБ.',
	);
	expect(screen.queryByTestId('cropper')).not.toBeInTheDocument();
	expect(action).not.toHaveBeenCalled();
});

// JSDOM verifies DOM/CSS contracts, not actual browser geometry.
it.each([null, oldImage])(
	'anchors the default trigger to its frame with and without Popover: %j',
	(image) => {
		const { container } = render(<AvatarEditor image={image} avatarAction={action} />);
		const trigger = screen.getByRole('button', {
			name: image ? 'Обновить фотографию' : 'Добавить фотографию',
		});
		const frame = container.querySelector('.frame');
		expect(frame).toContainElement(trigger);
		expect(trigger).toHaveClass('trigger');
		expect(trigger.closest('.frame')).toBe(frame);
		if (image) {
			expect(trigger.parentElement).not.toBe(frame);
			expect(screen.getByRole('img', { name: 'Аватар' })).toHaveClass('image');
		} else {
			expect(trigger.parentElement).toBe(frame);
			expect(trigger).toContainElement(screen.getByTestId('AvatarWithoutPhoto_Wrapper'));
		}
	},
);
it('preserves the actual default Popover open and close behavior', async () => {
	render(<AvatarEditor image={oldImage} avatarAction={action} />);
	const trigger = screen.getByRole('button', { name: 'Обновить фотографию' });
	expect(trigger).toHaveAttribute('aria-expanded', 'false');
	fireEvent.click(trigger);
	expect(await screen.findByRole('button', { name: 'Удалить фотографию' })).toBeInTheDocument();
	expect(trigger).toHaveAttribute('aria-expanded', 'true');
	fireEvent.keyDown(trigger, { key: 'Escape' });
	await waitFor(() =>
		expect(screen.queryByRole('button', { name: 'Удалить фотографию' })).toBeNull(),
	);
	expect(trigger).toHaveAttribute('aria-expanded', 'false');
	expect(action).not.toHaveBeenCalled();
});
it.each([null, oldImage])(
	'keeps profile-edit outside the positioned default trigger: %j',
	(image) => {
		const { container } = render(
			<AvatarEditor image={image} avatarAction={action} variant="profile-edit" />,
		);
		expect(container.querySelector('.trigger')).toBeNull();
		expect(container.querySelector('.frame')).toBeNull();
		const picture = container.querySelector('.edit-picture');
		if (image) expect(picture).toContainElement(screen.getByRole('img', { name: 'Фото профиля' }));
		else expect(picture).toContainElement(screen.getByTestId('AvatarWithoutPhoto_Wrapper'));
	},
);
it('retains frame dimensions and responsive ratio while positioning the trigger independently of wrapper height', () => {
	const css = readFileSync(
		join(process.cwd(), 'src/features/profile/avatar/ui/AvatarEditor.module.css'),
		'utf8',
	);
	expect(css).toMatch(
		/\.frame\s*\{[^}]*position: relative;[^}]*height: 188px;[^}]*overflow: hidden;[^}]*border-radius: 20px;/,
	);
	expect(css).toMatch(
		/\.trigger\s*\{[^}]*position: absolute;[^}]*inset: 0;[^}]*width: 100%;[^}]*height: 100%;/,
	);
	expect(css).toMatch(
		/\.image\s*\{[^}]*display: block;[^}]*width: 100%;[^}]*height: 100%;[^}]*object-fit: cover;/,
	);
	expect(css).toMatch(
		/@media \(width <= 768px\)[\s\S]*?\.frame\s*\{[^}]*aspect-ratio: 296 \/ 263;/,
	);
	expect(css).toMatch(/@media \(width <= 576px\)[\s\S]*?\.frame\s*\{[^}]*height: auto;/);
	expect(css).toMatch(/\.edit-picture\s*\{[^}]*height: 188px;/);
	expect(css).toMatch(
		/\.edit-image\s*\{[^}]*display: block;[^}]*width: 100%;[^}]*height: 100%;[^}]*object-fit: cover;/,
	);
});

it('publishes the confirmed URL without auth requests even if session is stale', async () => {
	sessionImage = oldImage;
	render(<AvatarEditor image={oldImage} avatarAction={action} variant="profile-edit" />);
	fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
	await waitFor(() =>
		expect(screen.getByRole('img', { name: 'Фото профиля' })).toHaveAttribute('src', newImage),
	);
	expect(screen.queryByRole('status')).toBeNull();
	expect(screen.queryByText('Фотография профиля обновлена.')).toBeNull();
	expect(getSession).not.toHaveBeenCalled();
	expect(update).not.toHaveBeenCalled();
	expect(refresh).not.toHaveBeenCalled();
});
