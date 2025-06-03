import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const useShareUsernames = (graphId: string): string[] => {
  const [usernames, setUsernames] = useState<string[]>([]);

  useEffect(() => {
    const fetchShareUsernames = async (): Promise<void> => {
      const response = await axios.get(`${API_URL}/api/user/share`, {
        params: { graphId }
      });
      const data = response.data;
      setUsernames(data.usernames);
    };

    fetchShareUsernames();
  }, [graphId]);

  return usernames;
};

export default useShareUsernames;
