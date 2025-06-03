import { FC, useState } from "react";

import ShareGraphModal from "./ShareGraphModal";

interface ShareGraphButtonProps {
  graphId: string;
}

const ShareGraphButton: FC<ShareGraphButtonProps> = ({ graphId }) => {
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
        Share
      </button>
      {showModal && <ShareGraphModal graphId={graphId} onClose={handleClose} />}
    </>
  );
};

export default ShareGraphButton;
