"use client";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, Suspense, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const VerifyEmailContent: FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(response.data.message);
        setTimeout(() => router.push("/login"), 3000);
      } catch (error) {
        setStatus("error");
        setMessage((error as Error).message || "Verification failed.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return status === "loading" ? (
    <div className="flex items-center justify-center min-h-screen gap-4">
      <Loader2 className="animate-spin" />
      Verifying your email...
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md p-8 text-center bg-white rounded-lg shadow">
        {status === "success" ? (
          <>
            <h2 className="text-2xl font-bold text-green-500">Email Verified</h2>
            <p className="mt-4 text-gray-600">Redirecting to login...</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-500">Verification Failed</h2>
            <p className="mt-4 text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

const VerifyEmail: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmail;
