"use client";
import { Background, BackgroundVariant, ReactFlowProvider } from "@xyflow/react";
import { FC, PropsWithChildren } from "react";

import { WindowSize } from "@/const";
import useWindowSize from "@/hooks/useWindowSize";
import DashboardHeader from "./Header";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const windowSize = useWindowSize();

  return (
    <ReactFlowProvider>
      <div
        className={`h-screen w-screen ${
          windowSize === WindowSize.DESKTOP
            ? "bg-[#F5F7F8]"
            : windowSize === WindowSize.MOBILE
              ? "bg-white"
              : ""
        }`}
      >
        {windowSize === WindowSize.DESKTOP && (
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} className="z-20" />
        )}
        <DashboardHeader />
        {children}
      </div>
    </ReactFlowProvider>
  );
};

export default DashboardLayout;
