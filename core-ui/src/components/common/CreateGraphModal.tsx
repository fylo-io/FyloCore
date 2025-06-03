import { X } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface CreateGraphModalProps {
  onClose: () => void;
  onCreateGraph: (title: string, description: string) => void;
}

const CreateGraphModal: FC<CreateGraphModalProps> = ({ onClose, onCreateGraph }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreateGraph(title, description);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50 p-4 transition-opacity duration-300">
      <div
        className={`bg-white w-full max-w-sm h-full p-5 shadow-lg rounded-[10px] relative transform transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-6 text-gray-900">Create New Graph</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Graph Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter graph title"
              className="w-full border border-gray-300 rounded-[8px] p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full border border-gray-300 rounded-[8px] p-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded-[8px] hover:bg-green-700 transition w-fit"
          >
            Done
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGraphModal;
