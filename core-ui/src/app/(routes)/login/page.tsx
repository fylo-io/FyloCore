"use client";
import { Eye, EyeOff, LockKeyhole, User } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";

const Login: FC = () => {
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image 
            src="/images/fylo-logo-white.svg" 
            alt="Fylo Logo" 
            width={120} 
            height={40} 
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your Fylo account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User
              className="absolute top-6 left-6"
              height={20}
              width={20}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Enter your username or email"
              value={form.usernameOrEmail}
              onChange={handleChange}
              className="w-full pl-14 pr-6 py-4 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="relative">
            <LockKeyhole
              className="absolute top-6 left-6"
              height={20}
              width={20}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            {form.password.length > 0 &&
              (showPassword ? (
                <EyeOff
                  className="absolute top-6 right-6 cursor-pointer"
                  height={20}
                  width={20}
                  color="#A9ADB3"
                  strokeWidth={1.7}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute top-6 right-6 cursor-pointer"
                  height={20}
                  width={20}
                  color="#A9ADB3"
                  strokeWidth={1.7}
                  onClick={() => setShowPassword(true)}
                />
              ))}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-14 pr-14 py-4 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
