import axios from "axios";
import { CircleX, Link2 } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FC, useEffect, useState } from "react";
import Avatar from "react-avatar";
import toast from "react-hot-toast";

import LoadingSpinner from "./Toolbar/LoadingSpinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ShareGraphModalProps {
  graphId: string;
  onClose: () => void;
}

interface Viewer {
  name: string;
  profile_color: string;
  avatar_url: string;
}

const ShareGraphModal: FC<ShareGraphModalProps> = ({ graphId, onClose }) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [invitedUser, setInvitedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/graph/viewers/${graphId}`)
      .then(response => {
        setViewers(response.data.viewers);
      })
      .catch(error => {
        toast.error("Error fetching user profile data:", error);
      })
      .finally(() => setLoading(false));
  }, [graphId]);

  const handleShare = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/share`, {
        graphId: graphId,
        usernameOrEmail: invitedUser
      });
      setLoading(false);
      //TODO lets add state for if user already has access
      if (response.status === 201) {
        toast.success(
          `${response.data.message} ${"with " + invitedUser}` ||
            `${"Graph shared successfully with "} ${invitedUser}`,
          { position: "bottom-right" }
        );
        onClose();
      } else {
        toast.error(response.data.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      toast.error((error as Error).message);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${pathname}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-500 flex flex-row justify-center items-center">
      <div
        className={`bg-white shadow-lg rounded-[10px] w-[500px] relative transform transition-transform duration-500 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-[1000px]"
        }`}
      >
        <div className="p-6 flex flex-row justify-between w-full items-center">
          <span className="text-[24px] font-semibold">Share to</span>
          <div className="flex flex-row justify-center items-center gap-2">
            <div className="flex flex-row justify-center items-center gap-1">
              <Link2
                className="stroke-[#9399A1] hover:stroke-[#2e3133] cursor-pointer"
                strokeWidth={1.3}
                onClick={handleCopy}
              />
              <span className="text-[#9399A1] text-[16px]">
                {isCopied ? "Copied" : "Copy link"}
              </span>
            </div>
            <CircleX
              className="stroke-[#9399A1] hover:stroke-[#2e3133] transition-colors duration-300 cursor-pointer"
              onClick={handleClose}
            />
          </div>
        </div>
        <hr />
        <div className="p-6 flex flex-col justify-between w-full items-center">
          <div className="flex flex-row items-center gap-2 w-full">
            <input
              className="rounded-[8px] p-[14px] border-2 border-[#E5E8EC] text-[16px] text-[#9399A1] w-full"
              type="text"
              value={invitedUser}
              onChange={e => setInvitedUser(e.target.value)}
              placeholder="Invite others by name or email"
            />
            <button
              className="rounded-[8px] p-[14px] text-[16px] text-white bg-black"
              onClick={handleShare}
              disabled={!invitedUser.length}
            >
              Invite
            </button>
          </div>
          <div className="mt-6 flex flex-col w-full gap-[10px]">
            <div className="flex flex-row gap-2">
              <span className="text-[#9399A1] text-[12px]">Who has access</span>
              {loading && <LoadingSpinner />}
            </div>
            {viewers &&
              viewers.map((viewer, index) => (
                <div key={index} className="flex flex-row justify-between items-center w-full">
                  <div className="flex flex-row gap-2 items-center">
                    {viewer.avatar_url ? (
                      <Image
                        src={viewer.avatar_url}
                        alt="Avatar Preview"
                        width={24}
                        height={24}
                        unoptimized
                        className="rounded-full h-[24px] object-cover cursor-pointer"
                      />
                    ) : (
                      <Avatar
                        className="cursor-pointer"
                        name={viewer.name}
                        round
                        size="24"
                        textSizeRatio={2}
                        color={viewer.profile_color}
                      />
                    )}
                    <span className="text-[14px]">{viewer.name}</span>
                  </div>
                  <span className="text-[14px] text-[#9399A1]">
                    {index === 0 ? "Owner" : "Contributor"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareGraphModal;
