import { ClaimDetailedInfo } from "@/types/detailSidePanel";
import {
  TitleAndDescription,
  TitleAndDescriptionControlled,
  TitleAndLinks,
  TitleAndSubQuestions
} from "./components";

const ClaimDetailedInfoContent = ({
  claimStatement,
  explanationReasoning,
  implications,
  levelConfidence,
  referencesCitations,
  scopeConditions,
  supportingContradictoryEvidence
}: ClaimDetailedInfo) => {
  return (
    <>
      <TitleAndDescriptionControlled title="Implication" description={implications} />
      <TitleAndDescriptionControlled title="Claim Statement" description={claimStatement} />
      <TitleAndDescriptionControlled title="Level Of Confidence" description={levelConfidence} />
      <TitleAndDescriptionControlled title="Scope Conditions" description={scopeConditions} />

      {referencesCitations && referencesCitations?.length > 0 && (
        <TitleAndLinks
          title="References Citations"
          links={referencesCitations.map(item => ({ link: item }))}
        />
      )}
      {explanationReasoning && (
        <TitleAndDescription title="Explanation Reasoning" description={explanationReasoning} />
      )}
      {supportingContradictoryEvidence && supportingContradictoryEvidence?.length > 0 && (
        <TitleAndSubQuestions
          title="Supporting Contradictory Evidence"
          subQuestions={supportingContradictoryEvidence.map(question => ({
            question: question
          }))}
        />
      )}
      {/* <ReferencesAndCitations citations={citations} /> */}
    </>
  );
};
export default ClaimDetailedInfoContent;
