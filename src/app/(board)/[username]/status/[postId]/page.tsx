import Comments from "@/components/Comments";
import Image from "@/components/Image";
import Post from "@/components/Post";
import prisma from "@/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

const StatusPage = async ({
  params,
}: {
  params: Promise<{ username: string; postId: string }>;
}) => {
  const postId = (await params).postId;
  const username = (await params).username;

  const postIncludeQuery = {
    user: { select: { displayName: true, username: true, img: true } },
    _count: { select: { likes: true, rePosts: true, comments: true } },
    likes: { where: { user: { username: username } }, select: { id: true } },
    rePosts: { where: { user: { username: username } }, select: { id: true } },
    saves: { where: { user: { username: username } }, select: { id: true } },
  };

  const post = await prisma.post.findFirst({
    where: {
      id: parseInt(postId),
    },
    include: {
      comments: { include: postIncludeQuery },
      ...postIncludeQuery,
    },
  });

  if (!post) return notFound();

  return (
    <>
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
        <Link href="/">
          <Image path="icons/back.svg" alt="back" w={24} h={24} />
        </Link>
        <h1 className="font-bold text-lg">Post</h1>
      </div>
      <Post type="status" post={post} />
      <Comments
        comments={post.comments}
        username={post.user.username}
        postId={post.id}
      />
    </>
  );
};

export default StatusPage;
