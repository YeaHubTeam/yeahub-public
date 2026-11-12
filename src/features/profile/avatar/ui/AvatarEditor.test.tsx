import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

import { AvatarEditor } from '../index';
import type { AvatarActionResult } from '../model/types';

const refresh = jest.fn();
const update = jest.fn();
const canvas = jest.fn();
const cropped = 'data:image/png;base64,cG5n';
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { profile: 'profile', translation: 'translation' },
	useRouter: () => ({ refresh }),
}));
jest.mock('next-auth/react', () => ({ useSession: () => ({ update }) }));
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
	action.mockReset();
	action.mockResolvedValue({ status: 'success', avatarUrl: newImage });
	refresh.mockReset();
	update.mockReset();
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
		await screen.findByText('Фотография профиля обновлена.');
		expect(action).toHaveBeenCalledWith({ operation: 'set', avatarImage: 'cG5n' });
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledWith();
		expect(screen.getByRole('img', { name: 'Аватар' })).toHaveAttribute('src', newImage);
	},
);
it('deletes through the real Popover and restores the fallback', async () => {
	action.mockResolvedValue({ status: 'success', avatarUrl: null });
	update.mockResolvedValue({ user: { image: null } });
	render(<AvatarEditor image={oldImage} avatarAction={action} />);
	fireEvent.click(screen.getByRole('button', { name: 'Обновить фотографию' }));
	fireEvent.click(await screen.findByRole('button', { name: 'Удалить фотографию' }));
	await screen.findByText('Фотография профиля обновлена.');
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
it('handles sync-required without a second PATCH and offers manual synchronization', async () => {
	action.mockResolvedValue({ status: 'sync-required' });
	const { container } = render(<AvatarEditor image={oldImage} avatarAction={action} />);
	await select(container);
	fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));
	await screen.findByText(
		'Аватар мог быть изменён, но синхронизация не подтверждена. Обновите данные или страницу.',
	);
	expect(action).toHaveBeenCalledTimes(1);
	expect(update).toHaveBeenCalledWith({ syncAvatar: true });
	expect(screen.queryByText('Фотография профиля обновлена.')).not.toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'Обновить данные' }));
	await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
	expect(action).toHaveBeenCalledTimes(1);
});
it('does not report full success if the session reread fails', async () => {
	update.mockRejectedValue(new Error('network'));
	const { container } = render(<AvatarEditor image={null} avatarAction={action} />);
	await select(container);
	fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));
	await screen.findByRole('status');
	expect(screen.queryByText('Фотография профиля обновлена.')).not.toBeInTheDocument();
	expect(action).toHaveBeenCalledTimes(1);
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
