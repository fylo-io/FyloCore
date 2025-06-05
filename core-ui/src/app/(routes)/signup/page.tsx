"use client";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

import { WindowSize } from "@/const";
import useWindowSize from "@/hooks/useWindowSize";

const Signup: FC = () => {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const windowSize = useWindowSize();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const res = await signIn("signup", {
        username: form.username,
        email: form.email,
        password: form.password,
        redirect: false
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        setMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {windowSize === WindowSize.DESKTOP && (
        <div className="absolute top-4 bottom-4 right-4 w-[700px] px-[40px] py-[60px] bg-form-background rounded-lg shadow overflow-y-auto">
          <Image src="/images/fylo-logo.svg" alt="Fylogenesis" height={55} width={65} />
          <h2 className="pt-[40px] text-[31px] font-bold text-form-title">Create an Account</h2>
          <p className="text-[20px] text-[#80858C]">
            Sign up in seconds and start exploring right away.
          </p>

          <div className="my-[22px] flex items-center justify-center space-x-2">
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
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-16 py-4 border rounded-[15px] bg-input-background border-input-border text-input-text text-[20px]"
              required
            />
            <Mail
              className="absolute top-28 left-6"
              height={36}
              width={28}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="mt-[34px] w-full px-16 py-4 border rounded-[15px] bg-input-background border-input-border text-input-text text-[20px]"
              required
            />
            <LockKeyhole
              className="absolute top-52 left-6"
              height={36}
              width={28}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            {form.password.length > 0 &&
              (showPassword ? (
                <EyeOff
                  className="absolute top-52 right-6 cursor-pointer"
                  height={36}
                  width={28}
                  color="#A9ADB3"
                  strokeWidth={1.7}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute top-52 right-6 cursor-pointer"
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
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="mt-[34px] w-full px-16 py-4 border rounded-[15px] bg-input-background border-input-border text-input-text text-[20px]"
              required
            />
            <label className="flex items-center space-x-2 cursor-pointer mt-[34px]">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-[#80858C]">Remember me</span>
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-[40px] py-4 text-white rounded-[15px] ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#121212] hover:bg-gray-900"
              }`}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-green-500 font-medium">{message}</p>
          )}
          {error && (
            <p className="mt-4 text-center text-red-500 font-medium">{error}</p>
          )}

          <p className="mt-[25px] text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-[#121212] font-bold">
              Log In
            </Link>
          </p>
        </div>
      )}

      {windowSize === WindowSize.MOBILE && (
        <div className="mx-6 my-16 px-[20px] py-[30px] bg-form-background rounded-lg shadow overflow-y-auto">
          <Image src="/images/fylo-logo.svg" alt="Fylogenesis" height={30} width={36} />
          <h2 className="pt-[30px] text-[18px] font-bold text-form-title">Create an Account</h2>
          <p className="text-[12px] text-[#80858C]">
            Sign up in seconds and start exploring right away.
          </p>

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
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-12 py-4 border rounded-[10px] bg-input-background border-input-border text-input-text text-[13px]"
              required
            />
            <Mail
              className="absolute top-24 left-4"
              height={28}
              width={24}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="mt-[30px] w-full px-12 py-4 border rounded-[10px] bg-input-background border-input-border text-input-text text-[13px]"
              required
            />
            <LockKeyhole
              className="absolute top-[180px] left-4"
              height={28}
              width={24}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            {form.password.length > 0 &&
              (showPassword ? (
                <EyeOff
                  className="absolute top-[180px] right-4 cursor-pointer"
                  height={28}
                  width={24}
                  color="#A9ADB3"
                  strokeWidth={1.7}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute top-[180px] right-4 cursor-pointer"
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
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="mt-[30px] w-full px-12 py-4 border rounded-[10px] bg-input-background border-input-border text-input-text text-[13px]"
              required
            />
            <label className="flex items-center space-x-2 cursor-pointer mt-[20px]">
              <input
                type="checkbox"
                className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-[#80858C] text-[12px]">Remember me</span>
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-[35px] py-4 text-white rounded-[10px] ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#121212] hover:bg-gray-900"
              }`}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-green-500 font-medium text-[13px]">{message}</p>
          )}
          {error && (
            <p className="mt-4 text-center text-red-500 font-medium text-[13px]">{error}</p>
          )}

          <p className="mt-4 text-center text-muted-foreground text-[13px]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#121212] font-bold">
              Log In
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Signup;
