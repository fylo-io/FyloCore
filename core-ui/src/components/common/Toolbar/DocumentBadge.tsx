import { FC } from "react";

import { DocumentStatus } from "@/const";

interface DocumentBadgeProps {
  status: DocumentStatus;
}

const DocumentBadge: FC<DocumentBadgeProps> = ({ status }) => {
  const badgeClasses = {
    bronze: "bg-yellow-600 border-yellow-700 text-black",
    closed: "bg-red-600 border-red-700 text-white",
    gold: "bg-yellow-300 border-yellow-400 text-black",
    green: "bg-green-600 border-green-700 text-white",
    hybrid: "bg-blue-500 border-blue-600 text-white",
    label: "bg-gray-300 border-gray-600 text-black"
  };

  return (
    <span className={`p-1 text-sm font-normal rounded-[4px] border-2 ${badgeClasses[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default DocumentBadge;
