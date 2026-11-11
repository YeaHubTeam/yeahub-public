import type { ComponentProps } from 'react';

import { UserCreateForm } from '@/widgets/authentication/registration';

import styles from './RegistrationPage.module.css';

type RegistrationPageProps = Required<
	Pick<ComponentProps<typeof UserCreateForm>, 'registerAction'>
>;

const RegistrationPage = ({ registerAction }: RegistrationPageProps) => {
	return (
		<div className={styles.wrapper}>
			<div className={styles.content}>
				<UserCreateForm registerAction={registerAction} />
			</div>
		</div>
	);
};

export default RegistrationPage;
