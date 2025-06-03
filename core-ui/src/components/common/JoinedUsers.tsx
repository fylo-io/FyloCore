"use client";

import { useSession } from "next-auth/react";
import { FC, useEffect, useState } from "react";
import AvatarGroup from "react-avatar-group";
import io, { Socket } from "socket.io-client";

let socket: Socket;

interface JoinedUsersProps {
  graphId: string;
  color: string;
}

interface UserInfo {
  name: string;
  color: string;
}

const JoinedUsers: FC<JoinedUsersProps> = ({ graphId, color }) => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    if (!graphId) return;

    socket = io(`${process.env.NEXT_PUBLIC_API_URL}/users`);

    if (graphId && session?.user?.name) socket.emit("join_room", graphId, session.user.name, color);

    socket.on("current_joined_users", (joinedUsers: UserInfo[]) => {
      setUsers(joinedUsers);
    });

    const handleBeforeUnload = () => {
      if (graphId && session?.user?.name)
        socket.emit("leave_room", graphId, session.user.name, color);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (graphId && session?.user?.name)
        socket.emit("leave_room", graphId, session.user.name, color);

      socket.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [graphId, session?.user?.name, color]);

  return (
    <AvatarGroup
      avatars={users.map(user => ({
        avatar: user.name,
        backgroundColor: user.color
      }))}
      initialCharacters={1}
      max={3}
      size={30}
      displayAllOnHover
      shadow={2}
    />
  );
};

export default JoinedUsers;
