"use client";
import { Eye, EyeOff, LockKeyhole, User } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { WindowSize } from "@/const";
import useWindowSize from "@/hooks/useWindowSize";

const Login: FC = () => {
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const windowSize = useWindowSize();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  useEffect(() => {
    setError("");
  }, [form]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6] dark:bg-[#111828] ">
      {windowSize === WindowSize.DESKTOP && (
        <div className="absolute top-4 bottom-4 right-4 w-[700px] px-[40px] py-[60px] bg-form-background rounded-lg shadow overflow-y-auto">
          <Image src="/images/fylo-logo.svg" alt="Fylogenesis" height={55} width={65} />
          <h2 className="pt-[60px] text-[31px] font-bold text-form-title">
            Log in to your Account
          </h2>
          <p className="text-[20px] text-[#80858C]">Please enter your details to log in.</p>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className={`mt-[70px] flex items-center justify-center w-full py-4 border rounded-[15px] bg-input-background border-input-border text-input-text text-[20px] hover:bg-gray-50 dark:hover:bg-gray-600 ${
              isLoading ? "cursor-not-allowed" : ""
            }`}
          >
            <FcGoogle className="w-7 h-7 mr-2" />
            Log In with Google
          </button>

          <div className="my-9 flex items-center justify-center space-x-2">
            <hr className="w-1/2 border-gray-400" />
            <p className="text-[17px] text-[#A9ADB3] font-bold">OR</p>
            <hr className="w-1/2 border-gray-400" />
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <User
              className="absolute top-3 left-6"
              height={36}
              width={28}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Username or Email *"
              value={form.usernameOrEmail}
              onChange={handleChange}
              className="w-full px-16 py-4 border rounded-[15px] bg-input-background border-input-border text-input-text text-[20px]"
              required
            />
            <LockKeyhole
              className="absolute top-32 left-6"
              height={36}
              width={28}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            {form.password.length > 0 &&
              (showPassword ? (
                <EyeOff
                  className="absolute top-32 right-6 cursor-pointer"
                  height={36}
                  width={28}
                  color="#A9ADB3"
                  strokeWidth={1.7}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute top-32 right-6 cursor-pointer"
                  height={36}
                  width={28}
                  color="#A9ADB3"
                  strokeWidth={1.7}
                  onClick={() => setShowPassword(true)}
                />
              ))}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password *"
              value={form.password}
              onChange={handleChange}
              className="mt-[50px] w-full px-16 py-4 border rounded-[15px] bg-input-background border-input-border text-input-text text-[20px]"
              required
            />
            <div className="flex flex-row justify-between items-center mt-[34px]">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[#80858C]">Remember me</span>
              </label>
              <a href="#" className="text-[#80858C] hover:underline">
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-[60px] py-4 text-white rounded-[15px] ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#121212] hover:bg-gray-900"
              }`}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
          {error && <p className="mt-4 text-center text-red-500 font-medium">{error}</p>}

          <p className="mt-[25px] text-center text-muted-foreground">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-[#121212] font-bold">
              Sign Up
            </Link>
          </p>
        </div>
      )}

      {windowSize === WindowSize.MOBILE && (
        <div className="mx-6 my-16 px-[20px] py-[30px] bg-form-background rounded-lg shadow overflow-y-auto">
          <Image src="/images/fylo-logo.svg" alt="Fylogenesis" height={30} width={36} />
          <h2 className="pt-[30px] text-[18px] font-bold text-form-title">
            Log in to your Account
          </h2>
          <p className="text-[12px] text-[#80858C]">Please enter your details to log in.</p>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className={`mt-[30px] flex items-center justify-center w-full py-3 border rounded-[10px] bg-input-background border-input-border text-input-text text-[15px] hover:bg-gray-50 dark:hover:bg-gray-600 ${
              isLoading ? "cursor-not-allowed" : ""
            }`}
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Log In with Google
          </button>

          <div className="my-[25px] flex items-center justify-center space-x-2">
            <hr className="w-1/2 border-gray-400" />
            <p className="text-[12px] text-[#A9ADB3]">OR</p>
            <hr className="w-1/2 border-gray-400" />
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <User
              className="absolute top-3 left-4"
              height={28}
              width={24}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Username or Email *"
              value={form.usernameOrEmail}
              onChange={handleChange}
              className="w-full px-12 py-4 border rounded-[10px] bg-input-background border-input-border text-input-text text-[13px]"
              required
            />
            <LockKeyhole
              className="absolute top-24 left-4"
              height={28}
              width={24}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            {form.password.length > 0 &&
              (showPassword ? (
                <EyeOff
                  className="absolute top-24 right-4 cursor-pointer"
                  height={28}
                  width={24}
                  color="#A9ADB3"
                  strokeWidth={1.7}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute top-24 right-4 cursor-pointer"
                  height={28}
                  width={24}
                  color="#A9ADB3"
                  strokeWidth={1.7}
                  onClick={() => setShowPassword(true)}
                />
              ))}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password *"
              value={form.password}
              onChange={handleChange}
              className="mt-[30px] w-full px-12 py-4 border rounded-[10px] bg-input-background border-input-border text-input-text text-[13px]"
              required
            />
            <div className="flex flex-row justify-between items-center mt-[20px] text-[12px]">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[#80858C]">Remember me</span>
              </label>
              <a href="#" className="text-[#80858C] hover:underline">
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-[35px] py-4 text-white rounded-[10px] ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#121212] hover:bg-gray-900"
              }`}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
          {error && (
            <p className="mt-4 text-center text-red-500 font-medium text-[13px]">{error}</p>
          )}

          <p className="mt-4 text-center text-muted-foreground text-[13px]">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-[#121212] font-bold">
              Sign Up
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
