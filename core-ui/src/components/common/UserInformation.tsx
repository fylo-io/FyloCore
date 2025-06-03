import { ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";

import { SignInStatus } from "@/const";
import { useUserStore } from "@/store/useUserStore";

const UserInformation: FC = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (user === SignInStatus.UNKNOWN || user === SignInStatus.NOT_SIGNED) return null;

  return (
    <div className="flex flex-row justify-between items-center gap-2.5 px-4 py-2.5 bg-white rounded-[15px]">
      {user.avatar_url ? (
        <Image
          src={user.avatar_url}
          alt="Avatar Preview"
          width={42}
          height={42}
          unoptimized
          className="rounded-full h-[42px] object-cover cursor-pointer"
        />
      ) : (
        <Avatar
          className="cursor-pointer"
          name={user.name}
          round
          size="42"
          textSizeRatio={2}
          color={user.profile_color}
        />
      )}
      <div className="flex flex-col justify-center">
        <span className="font-semibold">{user.name}</span>
        <span className="text-gray-400">{user.email}</span>
      </div>
      <ChevronDown className="cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)} />
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className={`absolute right-0 top-[50px] w-40 bg-white shadow-lg rounded-sm transition-all duration-200 ease-in-out 
                    ${dropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <ul className="flex flex-col text-sm text-gray-700">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-t-sm"
              onClick={() => router.push("/profile")}
            >
              Edit Profile
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-b-sm"
              onClick={handleSignOut}
            >
              Log Out
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserInformation;
