"use client";

import { followUser } from "@/actions";
import { socket } from "@/socket";
import { useUser } from "@clerk/nextjs";
import { useOptimistic, useState } from "react";

const FollowBtn = ({
  userId,
  isFollowed,
  username,
}: {
  userId: string;
  isFollowed: boolean;
  username: string;
}) => {
  const { user } = useUser();
  const [state, setState] = useState(isFollowed);

  const followAction = async () => {
    if (!user) return;

    if (!optimisticFollow) {
      socket.emit("sendNotification", {
        receiverUsername: username,
        data: {
          senderUsername: user.username,
          action: "follow",
          link: `/${username}`,
        },
      });
    }

    addOptimisticFollow("");
    await followUser(userId);
    setState((prev) => !prev);
  };

  const [optimisticFollow, addOptimisticFollow] = useOptimistic(
    state,
    (prevState) => !prevState
  );

  return (
    <form action={followAction}>
      <button className="py-2 px-4 bg-white text-black font-bold rounded-full">
        {optimisticFollow ? "Unfollow" : "Follow"}
      </button>
    </form>
  );
};

export default FollowBtn;
