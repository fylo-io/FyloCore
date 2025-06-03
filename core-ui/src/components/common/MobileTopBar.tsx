import { EllipsisVertical, MoveLeft, Search } from "lucide-react";
import Image from "next/image";
import { FC } from "react";
import Avatar from "react-avatar";

import { SignInStatus } from "@/const";
import { useUserStore } from "@/store/useUserStore";

interface MobileTopBarProps {
  graphName: string;
  onBack: () => void;
}

const MobileTopBar: FC<MobileTopBarProps> = ({ graphName, onBack }) => {
  const user = useUserStore(state => state.user);

  if (user === SignInStatus.NOT_SIGNED || user === SignInStatus.UNKNOWN) return null;

  return (
    <div className="absolute z-50 top-2.5 w-full px-4">
      <div className="bg-white rounded-[10px] pl-4 pr-2 py-5 flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center max-w-[60%]">
          <MoveLeft strokeWidth={1.5} onClick={onBack} />
          <span className="truncate text-[#121212] font-bold">{graphName}</span>
        </div>
        <div className="flex flex-row gap-3 items-center">
          <Search strokeWidth={1.3} />
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt="Avatar Preview"
              width={50}
              height={50}
              unoptimized
              className="rounded-full h-[50px] object-cover cursor-pointer"
            />
          ) : (
            <Avatar
              className="cursor-pointer"
              name={user.name}
              round
              size="30"
              textSizeRatio={2}
              color={user.profile_color}
              onClick={() => {}}
            />
          )}
          <EllipsisVertical strokeWidth={1.3} />
        </div>
      </div>
    </div>
  );
};

export default MobileTopBar;
