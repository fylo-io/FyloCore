"use client";
import { CircleX } from "lucide-react";
import { useState } from "react";

import { useEditStore } from "@/store/useEditStore";
import { ComboboxDemo } from "../ui/ComboBox";

interface EditNodeProps {
  close: () => void;
  id: string;
}

const EditNodeModal = ({ close, id }: EditNodeProps) => {
  const { setUpdateAction } = useEditStore();
  const [form, setForm] = useState({
    nodeType: "",
    nodeTitle: "",
    description: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleComboboxChange = (value: string) => {
    setForm(prev => ({ ...prev, nodeType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateAction(id, form.nodeType, form.nodeTitle, form.description);
    close();
  };

  return (
    <div className="fixed h-screen w-screen inset-0 z-[1000] bg-[#000000] bg-opacity-75 flex items-center justify-center text-[#121212]">
      <div className="flex flex-col max-w-[444px]  w-full h-fit bg-[#ffffff] rounded-[8px]">
        {/* //* Header */}
        <div className="flex justify-between gap-x-6 p-6 border-b border-[#E5E8EC]">
          <div className="font-medium text-[24px] text-[#121212]">Edit Node</div>
          <div onClick={close} className="cursor-pointer flex items-center justify-center">
            <CircleX className="stroke-[#9399A1] hover:stroke-[#2e3133] transition-colors duration-300 flex-shrink-0" />
          </div>{" "}
        </div>
        {/* //* Content */}
        <div className="flex flex-col p-6">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="gap-y-2 flex flex-col">
              <label className="text-[16px] font-medium text-[#525252]">Select Type of Node</label>
              <ComboboxDemo
                options={["Question", "Evidence", "Claim", "Investigation"]}
                value={form.nodeType}
                onChange={handleComboboxChange}
              />
            </div>
            <div className="gap-y-2 flex flex-col">
              <label className="text-[16px] font-medium text-[#525252]">Node Title</label>
              <input
                type="text"
                name="nodeTitle"
                value={form.nodeTitle}
                onChange={handleChange}
                className="flex w-full gap-x-[10px] h-12 rounded-[8px] border border-[#e5e5e5] placeholder:text-[16px] pl-3.5 placeholder:font-normal placeholder:text-[#525252] "
                placeholder="Node title"
              />
            </div>
            <div className="gap-y-2 flex flex-col">
              <label className="text-[16px] font-medium text-[#525252]">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="flex w-full h-[140px] resize-none  overflow-auto rounded-[8px] border border-[#e5e5e5] p-3 placeholder:text-[16px] placeholder:font-normal
                placeholder:text-[#525252]"
                placeholder="Enter description"
              />
            </div>
            <button
              type="submit"
              className="flex w-full h-12 p-4 items-center justify-center bg-black border border-[#070708] text-[16px] font-medium text-[#f5f5f5] rounded-[8px]"
            >
              Save Node
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditNodeModal;
