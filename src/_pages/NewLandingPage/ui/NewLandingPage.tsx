import { QuestionsAndTasksBlock } from "@/widgets/NewLanding/QuestionsAndTasks";

interface NewLandingPage {
	locale: string;
}

export const NewLandingPage = ({locale}: NewLandingPage) => {

	return(
		<>
			<QuestionsAndTasksBlock locale={locale} />
		</>
	)
}