import { useUserStore } from "@/store/useUserStore";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const useUserInfo = () => {
  const { data: session, status } = useSession();
  const { user, setUser, clearUser, loadingUser } = useUserStore();

  const fetchUserInfo = useCallback(() => {
    axios
      .get(`${API_URL}/api/user?userId=${session?.user.id}`)
      .then(response => {
        setUser(response.data.user);
      })
      .catch(error => {
        toast.error("Error fetching user profile data:", error);
      });
  }, [session, setUser]);

  useEffect(() => {
    if (status === "loading") {
      loadingUser();
    } else if (status === "authenticated") {
      fetchUserInfo();
    } else if (status === "unauthenticated") {
      clearUser();
    }
  }, [clearUser, fetchUserInfo, loadingUser, status]);

  return { user };
};

export default useUserInfo;
