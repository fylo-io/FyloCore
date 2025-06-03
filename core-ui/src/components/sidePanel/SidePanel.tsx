import {
  ClaimDetailedInfo,
  DefaultNodeProps,
  EvidenceDetailedInfo,
  InvestigationDetailedInfo,
  QuestionDetailedInfo
} from "@/types/detailSidePanel";
import ClaimDetailedInfoContent from "./SidePanelContentClaim";
import EvidenceDetailedInfoContentEvidence from "./SidePanelContentEvidence";
import InvestigationDetailedInfoContent from "./SidePanelContentInvestigation";
import QuestionDetailedInfoContent from "./SidePanelContentQuestion";
import SidePanelFooter from "./SidePanelFooter";
import SidePanelHeader from "./SidePanelHeader";

interface SidePanelProps extends DefaultNodeProps {
  close: () => void;
}
type NodeType = "Question" | "Investigation" | "Evidence" | "Claim";

const DetailSidePanel = ({ close, data }: SidePanelProps) => {
  return (
    <div className="w-[320px] lg:w-[410px] max-h-[85vh] overflow-y-auto border border-[#e5e5e5] dark:border-[#202020] rounded-t-[8px] rounded-b-[8px]  ">
      {/* //!* Container_Content */}
      <div className="flex flex-1 w-full h-fit bg-sidePanel-background gap-2 px-4 pb-4 items-center rounded-t-[8px]">
        {/* //* Container_Inner */}
        <div className="relative flex flex-col w-full h-fit">
          {/* //* Header*/}
          <SidePanelHeader
            close={close}
            node_type={data.node_type as NodeType}
            title={data.id || ""}
          />
          {/* //* Content Components*/}
          {data.node_type === "Evidence" ? (
            <EvidenceDetailedInfoContentEvidence
              {...(data.detailed_info as EvidenceDetailedInfo)}
            />
          ) : data.node_type === "Claim" ? (
            <ClaimDetailedInfoContent {...(data.detailed_info as ClaimDetailedInfo)} />
          ) : data.node_type === "Investigation" ? (
            <InvestigationDetailedInfoContent
              {...(data.detailed_info as InvestigationDetailedInfo)}
            />
          ) : data.node_type === "Question" ? (
            <QuestionDetailedInfoContent {...(data.detailed_info as QuestionDetailedInfo)} />
          ) : (
            <div>There is no detailed info for this node.</div>
          )}
        </div>
      </div>
      {/* //* Footer  */}
      {/* //? This can take date as prop, currently static. */}
      <SidePanelFooter />
    </div>
  );
};

export default DetailSidePanel;

//? p-4 is not used in the header to accomplish sticky header.
//? all the side-panel is hard-coded for 1512x982.
