"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Lock, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/components/common/Toolbar/LoadingSpinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
      setValidToken(false);
      return;
    }

    // Validate token when component mounts
    const validateToken = async () => {
      try {
        await axios.get(`${API_URL}/api/auth/validate-reset-token?token=${token}`);
        setValidToken(true);
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid or expired reset token");
        setValidToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        password
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (validToken === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center gap-4">
          <LoadingSpinner />
          Validating reset token...
        </div>
      </div>
    );
  }

  if (validToken === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 bg-form-background rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 px-4 bg-[#121212] text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 bg-form-background rounded-lg shadow text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-form-title mb-4">Password Reset Successful</h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You will be redirected to the login page in a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-form-background rounded-lg shadow">
        <div className="text-center mb-8">
          <Image 
            src="/images/fylo-logo.svg" 
            alt="Fylogenesis" 
            height={45} 
            width={55} 
            className="mx-auto mb-4" 
          />
          <h2 className="text-2xl font-bold text-form-title">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock
              className="absolute top-3 left-3"
              height={20}
              width={20}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border rounded-lg bg-input-background border-input-border text-input-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Lock
              className="absolute top-3 left-3"
              height={20}
              width={20}
              color="#A9ADB3"
              strokeWidth={1.7}
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border rounded-lg bg-input-background border-input-border text-input-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className={`w-full py-3 px-4 bg-[#121212] text-white rounded-lg font-medium transition-colors ${
              isLoading || !password || !confirmPassword
                ? "bg-gray-400 cursor-not-allowed"
                : "hover:bg-gray-800"
            }`}
          >
            {isLoading ? <LoadingSpinner /> : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
