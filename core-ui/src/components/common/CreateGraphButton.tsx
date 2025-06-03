import { CirclePlus } from "lucide-react";
import { FC, useState } from "react";

import CreateGraphModal from "./CreateGraphModal";

interface CreateGraphButtonProps {
  onCreateGraph: (title: string, description: string) => void;
}

const CreateGraphButton: FC<CreateGraphButtonProps> = ({ onCreateGraph }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        className="flex items-center gap-3 justify-center bg-[linear-gradient(253deg,_#0167F8_-49.2%,_#6EDE8A_130.36%)] text-white font-semibold py-4 px-9 rounded-[10px] shadow-md transition-all duration-200 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <CirclePlus />
        <p className="text-white text-[22px] font-medium">Create New Graph</p>
      </button>
      {showModal && <CreateGraphModal onClose={handleClose} onCreateGraph={onCreateGraph} />}
    </>
  );
};

export default CreateGraphButton;
