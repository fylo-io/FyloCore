import { EvidenceDetailedInfo } from "@/types/detailSidePanel";
import { TitleAndDescriptionControlled, TitleAndLinks, TitleAndSubQuestions } from "./components";

const EvidenceDetailedInfoContentEvidence = ({
  associatedClaims,
  citationsReferences,
  dataSourceLinks,
  dateVersion,
  evidenceSummaryKeyFinding,
  interpretationsConstraints,
  methodsContext,
  statisticalResults,
  typeOfEvidence
}: EvidenceDetailedInfo) => {
  return (
    <div>
      <TitleAndDescriptionControlled title="Date Version" description={dateVersion} />
      <TitleAndDescriptionControlled title="Methods Context" description={methodsContext} />
      <TitleAndDescriptionControlled title="Type Of Evidence" description={typeOfEvidence} />

      {dataSourceLinks?.length ? (
        <TitleAndLinks title="Data Source Links" links={dataSourceLinks.map(link => ({ link }))} />
      ) : null}

      {associatedClaims?.length ? (
        <TitleAndSubQuestions
          title="Associated Claims"
          subQuestions={associatedClaims.map(question => ({ question }))}
        />
      ) : null}

      <TitleAndDescriptionControlled
        title="Evidence Summary Key Finding"
        description={evidenceSummaryKeyFinding}
      />
      <TitleAndDescriptionControlled
        title="Interpretations Constraints"
        description={interpretationsConstraints}
      />
      <TitleAndDescriptionControlled title="Statistical Results" description={statisticalResults} />

      {citationsReferences?.length ? (
        <TitleAndLinks
          title="Citations References"
          links={citationsReferences.map(item => ({ link: item }))}
        />
      ) : null}

      {/* <ReferencesAndCitations citations={citations} /> */}
    </div>
  );
};
export default EvidenceDetailedInfoContentEvidence;
