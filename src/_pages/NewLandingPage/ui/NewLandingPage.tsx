import { QuestionsAndTasksBlock } from "@/widgets/NewLanding/QuestionsAndTasks";

import styles from './NewLandingPage.module.css';

interface NewLandingPage {
	locale: string;
}
export const NewLandingPage = ({locale}: NewLandingPage) => {

	return(
		<div className={styles.page}>
			<QuestionsAndTasksBlock locale={locale} />
		</div>
	)
}