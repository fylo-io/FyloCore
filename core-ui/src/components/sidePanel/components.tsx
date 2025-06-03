"use client";
import { CircleChevronDown, CircleChevronRight } from "lucide-react";
import { useState } from "react";

const sidePanelChevronStyle =
  "h-[14px] w-[14px] flex-shrink-0 stroke-[#525252] group-hover:stroke-[#222222] transition-all duration-300";
const sidePanelButtonStyle = "absolute top-0 left-0 pl-[1.5px] bg-sidePanel-background group";

//#region //* Title & Description => classic, most common one
interface TitleAndDescriptionProps {
  title?: string;
  description?: string;
}

const TitleAndDescription = ({ title, description }: TitleAndDescriptionProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="relative flex w-full h-fit gap-y-2 pl-2 title-and-description">
      <div className="flex flex-col gap-y-2 pl-4 border-l border-sidePanel-border pb-4">
        <span className="font-medium text-[12px] text-sidePanel-text_secondary leading-[1.225]">
          {title}
        </span>
        {isOpen && <p className="text-[14px] font-normal">{description}</p>}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className={sidePanelButtonStyle}>
        {isOpen ? (
          <CircleChevronDown className={sidePanelChevronStyle} />
        ) : (
          <CircleChevronRight className={sidePanelChevronStyle} />
        )}
      </button>
    </div>
  );
};

//? Conditional Version
const TitleAndDescriptionConditional = ({
  title,
  description
}: {
  title: string;
  description?: string;
}) => (description ? <TitleAndDescription title={title} description={description} /> : null);

//#endregion

//#region //* Badge & Text => the one with level attribute
interface BadgeAndDescriptionProps {
  title?: string;
  description?: string;
  level?: string;
}

const BadgeAndDescription = ({ title, description, level }: BadgeAndDescriptionProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  return (
    <div className="relative flex w-full h-fit gap-y-2 pl-2 title-and-description">
      <div className="flex flex-col gap-y-2 pl-4 pb-4 border-l border-sidePanel-border">
        <span className="font-medium text-[12px] text-sidePanel-text_secondary leading-[1.225]">
          {title}
        </span>
        {isOpen && (
          <div className="flex flex-col gap-y-[2px]">
            <div className="w-fit py-[2px] px-2 rounded-[4px] text-[8px] font-normal bg-[#B45309] text-[#FFFBEB]">
              {level}
            </div>
            <p className="font-normal text-[10px] text-sidePanel-text_secondary">{description}</p>
          </div>
        )}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className={sidePanelButtonStyle}>
        {isOpen ? (
          <CircleChevronDown className={sidePanelChevronStyle} />
        ) : (
          <CircleChevronRight className={sidePanelChevronStyle} />
        )}
      </button>
    </div>
  );
};

//#endregion

//#region //! Title & SubItemsProps => still not used.

interface TitleAndSubItemProps {
  title: string;
  level?: string;
  subItems: {
    id: string;
    label?: string;
    count?: number;
  }[];
}

const TitleAndSubItem = ({ title, subItems }: TitleAndSubItemProps) => (
  <div className="relative flex w-full h-fit gap-y-2 pl-2 ">
    {/* //? Context_div */}
    <div className="flex flex-col gap-y-2 pl-4 pb-4 border-l border-[#E5E8EC]">
      <span className="font-medium text-[12px] text-sidePanel-text_secondary">{title}</span>
      {subItems.map((item, index) => (
        <div className="flex gap-x-[2px]" key={`subItem-${index}`}>
          <div className="w-3 gap-y-[10px] flex flex-col text-sidePanel-text_primary text-[10px] font-normal">
            {index + 1}.
          </div>
          <div className="flex flex-col gap-y-[2px]">
            <span className="text-sidePanel-text_primary text-[14px] font-normal">{item.id}</span>
            <div className="flex">
              <div className="w-fit gap-x-[10px] px-2 py-[2px] bg-[#EDF0F4] border border-r-0 border-[#E5E8EC] rounded-l-[4px] text-sidePanel-text_secondary text-[10px] font-normal ">
                {item.label}
              </div>
              <div className="px-1 py-[2px] border border-[#E5E8EC] rounded-r-[4px] text-sidePanel-text_secondary text-[10px] font-normal">
                {item.count}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="absolute top-0 left-0 pl-[1.5px] bg-[#ffffff]">
      <CircleChevronDown className="h-[14px] w-[14px] flex-shrink-0 stroke-[#80858C]" />
    </div>
  </div>
);

//#endregion

//#region //* Title & Sub Questions =>  works with string[] / example => 1. 2. 3.
//? usage with string array below.
//? subQuestions={textInfo.detailed_info.associatedClaims.map((claim) => ({ question: claim }))}
interface TitleAndSubQuestionsProps {
  title?: string;
  subQuestions?: {
    question: string;
  }[];
}

const TitleAndSubQuestions = ({ title, subQuestions }: TitleAndSubQuestionsProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="relative flex w-full h-fit gap-y-2 pl-2 title-and-description ">
      {/* //? Context_div */}
      <div className="flex flex-col gap-y-2 pl-4 pb-4 border-l border-sidePanel-border">
        <span className="font-medium text-[12px] text-sidePanel-text_secondary leading-[1.225]">
          {title}
        </span>
        {subQuestions &&
          isOpen &&
          subQuestions.map((item, index) => (
            <div className="flex gap-x-[2px]" key={`subQuestion-${index}`}>
              <div className="w-3 gap-y-[10px] flex flex-col text-sidePanel-text_primary text-[10px] font-normal flex-shrink-0 pt-[2px]">
                {index + 1}.
              </div>
              <div className="flex gap-y-[2px]">
                <span className="text-sidePanel-text_primary text-[14px] font-normal">
                  {item.question}
                </span>
              </div>
            </div>
          ))}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className={sidePanelButtonStyle}>
        {isOpen ? (
          <CircleChevronDown className={sidePanelChevronStyle} />
        ) : (
          <CircleChevronRight className={sidePanelChevronStyle} />
        )}
      </button>
    </div>
  );
};

//#endregion

//#region //* Title & Links =>
//? can be used it with string array, same as the one above.

interface TitleAndLinksProps {
  title?: string;
  links?: {
    link: string;
  }[];
}

const TitleAndLinks = ({ title, links }: TitleAndLinksProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="relative flex w-full h-fit gap-y-2 pl-2 title-and-description ">
      <div className="flex flex-col gap-y-2 pl-4 pb-4 border-l border-sidePanel-border">
        <span className="font-medium text-[12px] text-sidePanel-text_secondary leading-[1.225]">
          {title}
        </span>
        {links &&
          isOpen &&
          links.map((item, index) => (
            <div className="flex gap-y-[2px]" key={`link-${index}`}>
              <span className="text-sidePanel-text_primary text-[14px] break-all">{item.link}</span>
            </div>
          ))}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className={sidePanelButtonStyle}>
        {isOpen ? (
          <CircleChevronDown className={sidePanelChevronStyle} />
        ) : (
          <CircleChevronRight className={sidePanelChevronStyle} />
        )}
      </button>
    </div>
  );
};

//#endregion

export {
  BadgeAndDescription,
  TitleAndDescription,
  TitleAndDescriptionConditional as TitleAndDescriptionControlled,
  TitleAndLinks,
  TitleAndSubItem,
  TitleAndSubQuestions
};

// //#region //* References And Citations
// //TODO refactor when proper data provided
//! please don't remove
// interface ReferencesAndCitationsProps {
//   citations?: { ref_id?: string; title?: string; doi?: string; year?: string };
// }

// const ReferencesAndCitations = ({ citations }: ReferencesAndCitationsProps) => (
//   <div className="flex flex-col gap-y-[10px] pt-3 items-start">
//     {/* //? Div_1 */}
//     <div className="w-fit flex flex-col gap-x-[10px] px-1 py-[2px] border border-[#E5E8EC] rounded-[4px] text-[10px] font-normal text-sidePanel-text_secondary">
//       References / Citations
//     </div>

//     <div className="flex flex-col justify-center gap-y-3">
//       <div className="flex gap-x-1">
//         {/* //? Inner_Inner_div_1 */}
//         <div className="flex flex-col gap-y-1">
//           <div className="px-2 py-1 w-fit text-[8px] font-normal text-[#070708] bg-[#EDF0F4] rounded-[4px]">
//             Research Paper
//           </div>
//           <span className="font-normal text-[12px] text-sidePanel-text_primary">
//             {citations?.title ?? "-"}
//           </span>
//           <div className="px-2 py-1 w-fit text-[8px] font-normal text-[#070708] bg-[#EDF0F4] rounded-[4px]">
//             Reference Id
//           </div>
//           <span className="font-normal text-[12px] text-sidePanel-text_primary">
//             {citations?.ref_id}
//           </span>
//           <div className="px-2 py-1 w-fit text-[8px] font-normal text-[#070708] bg-[#EDF0F4] rounded-[4px]">
//             Year
//           </div>
//           <span className="font-normal text-[12px] text-sidePanel-text_primary">
//             {citations?.year ?? "-"}
//           </span>
//           <div className="px-2 py-1 w-fit text-[8px] font-normal text-[#070708] bg-[#EDF0F4] rounded-[4px]">
//             Doi
//           </div>
//           <span className="font-normal text-[12px] text-sidePanel-text_primary">
//             {citations?.doi ?? "-"}
//           </span>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// //#endregion
