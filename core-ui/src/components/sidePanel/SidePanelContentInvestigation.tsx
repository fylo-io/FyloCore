import { InvestigationDetailedInfo } from "@/types/detailSidePanel";
import { TitleAndDescriptionControlled } from "./components";

const InvestigationDetailedInfoContent = ({
  durationTimeline,
  methodsProtocol,
  objectivesHypotheses,
  scopeContext,
  title
}: InvestigationDetailedInfo) => {
  return (
    <>
      <TitleAndDescriptionControlled title="Title" description={title} />
      <TitleAndDescriptionControlled title="Scope Context" description={scopeContext} />
      <TitleAndDescriptionControlled title="Methods Protocol" description={methodsProtocol} />
      <TitleAndDescriptionControlled title="Duration Timeline" description={durationTimeline} />
      <TitleAndDescriptionControlled
        title="Objectives / Hypotheses"
        description={objectivesHypotheses}
      />

      {/* <ReferencesAndCitations citations={citations} /> */}
    </>
  );
};
export default InvestigationDetailedInfoContent;
