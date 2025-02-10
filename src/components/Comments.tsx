"use client";

import { useActionState, useEffect } from "react";
import Image from "./Image";
import Post from "./Post";
import { Post as PostType } from "@prisma/client";
import { addComment } from "@/actions";
import { useUser } from "@clerk/nextjs";
import { socket } from "@/socket";

type UserSummary = {
  displayName: string | null;
  username: string;
  img: string | null;
};

type Engagement = {
  _count: { likes: number; rePosts: number; comments: number };
  likes: { id: number }[];
  rePosts: { id: number }[];
  saves: { id: number }[];
};

type CommentWithDetails = PostType &
  Engagement & {
    user: UserSummary;
  };

const Comments = ({
  comments,
  username,
  postId,
}: {
  comments: CommentWithDetails[];
  username: string;
  postId: number;
}) => {
  const { user } = useUser();

  const [state, formAction, isPending] = useActionState(addComment, {
    success: false,
    error: false,
  });

  useEffect(() => {
    if (state.success) {
      if (!user) return;

      socket.emit("sendNotification", {
        receiverUsername: username,
        data: {
          senderUsername: user.username,
          action: "comment",
          link: `/${username}/status/${postId}`,
        },
      });
    }
  }, [postId, state.success, user, username]);

  return (
    <>
      <form
        action={formAction}
        className="flex items-center justify-between gap-4 p-4 "
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={user?.imageUrl}
            alt={user?.username as string}
            w={100}
            h={100}
            tr={true}
          />
        </div>
        <input
          type="text"
          name="desc"
          className="flex-1 bg-transparent outline-none p-2 text-xl"
          placeholder="Post your reply"
        />
        <input type="number" hidden value={postId} name="postId" readOnly />
        <input type="text" hidden value={username} name="username" readOnly />
        <button
          disabled={isPending}
          className="py-2 px-4 font-bold bg-white text-black rounded-full disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          {isPending ? "Replying..." : "Reply"}
        </button>
      </form>
      {state.error && (
        <span className="text-red-600 px-4">Something went wrong!</span>
      )}
      {comments.map((comment) => (
        <div key={comment.id}>
          <Post type="comment" post={comment} />
        </div>
      ))}
    </>
  );
};

export default Comments;
