"use client";
import { SessionProvider } from "next-auth/react";

const RootLayoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>{children}</SessionProvider>
  );
};

export default RootLayoutClient;
