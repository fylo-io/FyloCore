import { Comment } from "@/types/comment";
interface InvestigationDetailedInfo {
  title?: string;
  scopeContext?: string;
  methodsProtocol?: string;
  durationTimeline?: string;
  objectivesHypotheses?: string;
  citations?: { ref_id?: string; title?: string; doi?: string; year?: string };
}
interface QuestionDetailedInfo {
  references?: string[];
  questionText?: string;
  contextBackground?: string;
  motivationRationale?: string;
  relatedSubquestions?: string[];
  hypothesisExpectedAnswer?: string;
  citations?: { ref_id?: string; title?: string; doi?: string; year?: string };
}
interface ClaimDetailedInfo {
  implications?: string;
  claimStatement?: string;
  levelConfidence?: string;
  scopeConditions?: string;
  referencesCitations?: string[];
  explanationReasoning?: string;
  supportingContradictoryEvidence?: string[];
  citations?: { ref_id?: string; title?: string; doi?: string; year?: string };
}
interface EvidenceDetailedInfo {
  dateVersion?: string;
  methodsContext?: string;
  typeOfEvidence?: string;
  dataSourceLinks?: string[];
  associatedClaims?: string[];
  statisticalResults?: string;
  citationsReferences?: string[];
  evidenceSummaryKeyFinding?: string;
  interpretationsConstraints?: string;
  citations?: { ref_id?: string; title?: string; doi?: string; year?: string };
}
type Detailed_Info =
  | EvidenceDetailedInfo
  | ClaimDetailedInfo
  | QuestionDetailedInfo
  | InvestigationDetailedInfo;

//! It is used by DefaultNode also.
//? All fields are optional now, otherwise EntityNode looks for some datas.
interface DefaultNodeProps {
  id: string;
  data: {
    id?: string;
    description?: string;
    citation?: { ref_id?: string; title?: string; doi?: string; year?: string };
    detailed_info?: Detailed_Info;
    node_type?: string;
    is_moving?: boolean;
    picker_color?: string;
    is_root?: boolean;
    comments?: Comment[];
    reference?: boolean;
    locked?: boolean;
  };
}

export type {
  ClaimDetailedInfo,
  DefaultNodeProps,
  Detailed_Info,
  EvidenceDetailedInfo,
  InvestigationDetailedInfo,
  QuestionDetailedInfo
};
