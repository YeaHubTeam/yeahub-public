import ForgotPasswordPage from '../../../_ui/ForgotPasswordPage/ForgotPasswordPage';
import { sendPasswordResetEmail } from './actions';

const Page = () => <ForgotPasswordPage sendEmailAction={sendPasswordResetEmail} />;

export default Page;
