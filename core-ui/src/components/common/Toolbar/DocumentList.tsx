import { FC } from "react";

import { SourceType } from "@/const";
import { SourceDocument } from "@/types/document";

interface DocumentListProps {
  documents: SourceDocument[];
  collapsed: boolean;
  sourceType: SourceType;
  onAddToGraph: () => void;
  onCollapsed: (isCollapsed: boolean) => void;
  onRemoveDocument: (index: number) => void;
}

const DocumentList: FC<DocumentListProps> = ({ documents, onAddToGraph }) => {
  return (
    <div className="flex flex-row items-center gap-8 mb-3">
      <div className="rounded-md border-2 border-[#DEE4ED] bg-[#F5F5F5] px-8 py-3">
        {documents.length} Import
      </div>
      <span className="text-[#0167F8] underline cursor-pointer" onClick={onAddToGraph}>
        Add to Graph
      </span>
    </div>
  );
};

export default DocumentList;
