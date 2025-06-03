import { QuestionDetailedInfo } from "@/types/detailSidePanel";
import { TitleAndDescriptionControlled, TitleAndLinks, TitleAndSubQuestions } from "./components";

const QuestionDetailedInfoContent = ({
  contextBackground,
  hypothesisExpectedAnswer,
  motivationRationale,
  questionText,
  references,
  relatedSubquestions
}: QuestionDetailedInfo) => {
  return (
    <>
      {references?.length ? (
        <TitleAndLinks title="References" links={references.map(link => ({ link }))} />
      ) : null}

      <TitleAndDescriptionControlled title="Question Text" description={questionText} />
      <TitleAndDescriptionControlled title="Context Background" description={contextBackground} />
      <TitleAndDescriptionControlled
        title="Motivation Rationale"
        description={motivationRationale}
      />

      {relatedSubquestions?.length ? (
        <TitleAndSubQuestions
          title="Related Subquestions"
          subQuestions={relatedSubquestions.map(question => ({ question }))}
        />
      ) : null}

      <TitleAndDescriptionControlled
        title="Hypothesis Expected Answer"
        description={hypothesisExpectedAnswer}
      />

      {/* <ReferencesAndCitations citations={citations} /> */}
    </>
  );
};
export default QuestionDetailedInfoContent;
