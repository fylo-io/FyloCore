"use client";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";

import UserInformation from "@/components/common/UserInformation";
import FyloLogo from "@/components/icons/FyloLogo";
import { SignInStatus } from "@/const";
import useUserInfo from "@/hooks/useUserInfo";

const HomePage = memo(() => {
  const router = useRouter();
  const { user } = useUserInfo();

  if (user === SignInStatus.UNKNOWN) {
    return (
      <div className="h-screen w-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const isNotSignedIn = user === SignInStatus.NOT_SIGNED;
  const isSignedIn = !isNotSignedIn;

  return (
    <div className="flex w-full min-h-screen justify-center bg-[#121212]">
      {/* Layout */}
      <div className="relative flex flex-col min-h-screen max-w-screen-2xl w-full">
        {/* Spline */}
        <div className="absolute flex items-start justify-center w-full h-full pointer-events-none">
          <iframe
            title="Particles Animation"
            allowFullScreen
            className="w-full h-full"
            loading="lazy"
            src="https://my.spline.design/particlescopy-e62c4327e3cb5c000fa3d39f14705b7c/"
          />
        </div>

        {/* Fylo Logo */}
        <div className="absolute flex w-full h-full px-6 lg:px-8 xl:px-24 items-center justify-center pointer-events-none">
          <div className="bg-[url(../../public/images/fylo-logo-white.svg)] w-full md:w-6/12 xl:w-5/12 h-full bg-contain bg-center opacity-20 bg-no-repeat" />
        </div>

        {/* Top Navigation */}
        <div className="flex items-center w-full justify-between pt-7 z-50 px-6 lg:px-8 xl:px-24">
          <FyloLogo />
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <button
                type="button"
                className="flex items-center justify-center px-4 h-12 rounded-[8px] bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-sm font-medium"
                onClick={() => router.push("/dashboard")}
              >
                <LayoutDashboard className="mr-2 w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                type="button"
                className="flex items-center justify-center px-4 h-12 rounded-[8px] bg-white text-[#121212] hover:bg-gray-100 transition-colors text-sm font-medium"
                onClick={() => router.push("/login")}
              >
                Login
                <ArrowRight className="ml-2 stroke-1.5 w-4 h-4" />
              </button>
            )}
          </div>

          {isSignedIn && <UserInformation />}
        </div>
      </div>
    </div>
  );
});

HomePage.displayName = "HomePage";

export default HomePage;
