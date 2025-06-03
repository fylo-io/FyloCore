import { UserType } from "@/const";

export interface User {
  id: string;
  created_at: Date | string;
  name: string;
  email: string;
  password?: string;
  type: UserType;
  verified: boolean;
  profile_color: string;
  avatar_url?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  profile_color: string;
}
