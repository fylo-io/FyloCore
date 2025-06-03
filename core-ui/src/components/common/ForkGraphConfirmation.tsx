import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { SignInStatus } from "@/const";
import { useUserStore } from "@/store/useUserStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ForkGraphConfirmationProps {
  graphId: string;
  graphName: string;
  onClose: () => void;
}

const ForkGraphConfirmation: FC<ForkGraphConfirmationProps> = ({ graphId, graphName, onClose }) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleFork = async () => {
    if (user === SignInStatus.NOT_SIGNED || user === SignInStatus.UNKNOWN) return;

    const response = await axios.post(`${API_URL}/api/graph`, {
      title: `${user.name}'s ${graphName}`,
      description: `Forked from ${graphName}`,
      creatorId: user.id,
      sourceGraphId: graphId
    });

    if (response.status !== 201) {
      toast.error("Error creating forked graph!");
    } else {
      router.push(`/graph-view/${response.data.graph.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-500 flex flex-row justify-center items-center">
      <div
        className={`bg-white p-6 shadow-lg rounded-[10px] w-[500px] relative transform transition-transform duration-500 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-[1000px]"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Are you confirming?</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">This will fork from the public graph.</div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFork}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForkGraphConfirmation;
