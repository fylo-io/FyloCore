"use client";
import axios from "axios";
import { CircleX } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { FC, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { useUserStore } from "@/store/useUserStore";
import LoadingSpinner from "./Toolbar/LoadingSpinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginModalProps {
  close: () => void;
}

export const LoginModal: FC<LoginModalProps> = ({ close }) => {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("signin", {
        usernameOrEmail: form.usernameOrEmail,
        password: form.password,
        redirect: false
      });

      if (res?.error) {
        setError(res.error || "Invalid credentials, please try again.");
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { redirect: false });
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      axios.get(`${API_URL}/api/user?userId=${session?.user.id}`).then(response => {
        setUser(response.data.user);
      });
    }
  }, [session, status, setUser]);

  useEffect(() => {
    setError("");
  }, [form]);

  return (
    <div className="fixed h-screen w-screen inset-0 z-[1000] bg-[#000000] bg-opacity-75 flex items-center justify-center  text-[#121212]">
      <div className="mx-2 md:mx-0 max-w-[444px] max-h-[640px] w-full h-fit bg-[#ffffff] rounded-[8px]">
        <form onSubmit={handleSubmit} className="flex flex-col w-full h-full">
          <div className="flex justify-between items-center w-full h-[72px] border-b border-[#E5E8EC] p-6">
            <div className="text-2xl font-medium">Hold up!</div>
            <div onClick={close} className="cursor-pointer">
              <CircleX className="stroke-[#9399A1] hover:stroke-[#2e3133] transition-colors duration-300" />
            </div>
          </div>
          <div className="flex w-full flex-1 border-b border-[#E5E8EC] p-6">
            <div className="flex w-full flex-col text-[#72777D] gap-5">
              <div className="text-[12px] font-medium leading-4">
                You’ll have to Log In or Sign Up (for free!) to clone this graph. Don’t worry! This
                graph will be saved to your account.
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-medium leading-7">Username*</span>
                <input
                  className="placeholder-[#9399A1] text-[#121212] w-full h-12  font-normal rounded-[8px] border border-[#E5E8EC] p-[14px]"
                  type="text"
                  name="usernameOrEmail"
                  value={form.usernameOrEmail}
                  onChange={handleChange}
                  required
                  placeholder="Enter Username or Email"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-medium leading-7">Password*</span>
                <input
                  className="placeholder-[#9399A1] text-[#121212] w-full h-12 font-normal rounded-[8px] border border-[#E5E8EC] p-[14px]"
                  placeholder="Enter your password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className=" font-normal  flex items-center justify-between ">
                <div className="flex items-center space-x-1.5 text-[#121212]">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 stroke-[#121212] fill-[#121212]"
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <span className="text-[#0048AE] hover:underline underline-offset-2 cursor-pointer">
                  Forgot Password?
                </span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center w-full h-12 bg-[#121212] text-white rounded-[8px] font-medium"
                  ${isLoading ? "bg-gray-400 cursor-not-allowed" : ""}
                `}
              >
                {isLoading ? <LoadingSpinner /> : "Create Graph"}
              </button>
              {error && <p className="text-center text-red-400 font-medium">{error}</p>}
              <div className="flex w-full items-center">
                <span className="w-full border h-[1px]"></span>
                <span className="font-medium text-[12px] px-1">OR</span>
                <span className="w-full border h-[1px]"></span>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className={`flex w-full h-12 items-center justify-center border rounded-[8px]   ${
                  isLoading ? "cursor-not-allowed" : ""
                }`}
              >
                <FcGoogle className="w-7 h-7 mr-2" />
                <span className="ml-2 font-medium text-[#121212]">Log In With Google</span>
              </button>
            </div>
          </div>
          <div className="flex w-full items-center mt-auto justify-center h-[60px] text-[16px] font-normal bg-[#F5F5F5] rounded-[8px]">
            <div>
              Need to create an account?
              <span className="ml-1 text-[#0048AE] hover:underline underline-offset-2 cursor-pointer ">
                Sign Up for Fylo
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
