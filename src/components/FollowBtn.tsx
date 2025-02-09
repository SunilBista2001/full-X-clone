"use client";

import { followUser } from "@/actions";
import { useOptimistic, useState } from "react";

const FollowBtn = ({
  userId,
  isFollowed,
}: {
  userId: string;
  isFollowed: boolean;
}) => {
  const [state, setState] = useState(isFollowed);

  const followAction = async () => {
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
