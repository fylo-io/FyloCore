import { Menu, Search } from "lucide-react";
import Image from "next/image";
import { FC } from "react";

import UserInformation from "@/components/common/UserInformation";
import { SignInStatus, WindowSize } from "@/const";
import useWindowSize from "@/hooks/useWindowSize";
import { useUserStore } from "@/store/useUserStore";

const DashboardHeader: FC = () => {
  const { user } = useUserStore();
  const windowSize = useWindowSize();

  if (user === SignInStatus.UNKNOWN) return null;

  return (
    <>
      {windowSize === WindowSize.DESKTOP && (
        <div className="w-full z-50 absolute">
          <Image
            src="/images/fylo-logo.svg"
            alt="Fylogenesis"
            className="absolute top-10 left-[30px]"
            height={30}
            width={35}
          />
          {user && (
            <div className="absolute z-50 top-[25px] right-[30px]">
              <UserInformation />
            </div>
          )}
        </div>
      )}

      {windowSize === WindowSize.MOBILE && (
        <div className="flex flex-row justify-between items-center p-5">
          <Menu />
          <Image src="/images/fylo-logo.svg" alt="Fylogenesis" height={30} width={35} />
          <Search />
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
