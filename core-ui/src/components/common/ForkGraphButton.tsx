import { FC, useState } from "react";

import ForkGraphConfirmation from "./ForkGraphConfirmation";

interface ForkGraphButtonProps {
  graphId: string;
  graphName: string;
}

const ForkGraphButton: FC<ForkGraphButtonProps> = ({ graphId, graphName }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        className="bg-white rounded-[15px] h-[68px] flex flex-row justify-center items-center px-8 text-[24px] font-semibold cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        Fork Graph
      </button>
      {showModal && (
        <ForkGraphConfirmation graphId={graphId} graphName={graphName} onClose={handleClose} />
      )}
    </>
  );
};

export default ForkGraphButton;
