import RegistrationPage from '../../../_ui/RegistrationPage/RegistrationPage';
import { registerUser } from './actions';

const Page = () => <RegistrationPage registerAction={registerUser} />;

export default Page;
