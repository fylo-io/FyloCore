import { SignInStatus } from "@/const";
import { User } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  user: User | SignInStatus.NOT_SIGNED | SignInStatus.UNKNOWN;
  isContributor: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  loadingUser: () => void;
  setAsContributor: () => void;
  setAsNonContributor: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    set => ({
      user: SignInStatus.UNKNOWN,
      isContributor: false,
      setUser: (user: User) => set({ user }),
      clearUser: () => set({ user: SignInStatus.NOT_SIGNED }),
      loadingUser: () => set({ user: SignInStatus.UNKNOWN }),
      setAsContributor: () => set({ isContributor: true }),
      setAsNonContributor: () => set({ isContributor: false })
    }),
    { name: "user-store" }
  )
);
