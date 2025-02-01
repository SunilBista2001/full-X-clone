import prisma from "@/prisma";
import Post from "./Post";

const Feed = async () => {
  const posts = await prisma.post.findMany();

  return (
    <div className="">
      {posts.map((posts) => (
        <div key={posts.id} className="">
          <Post />
        </div>
      ))}
    </div>
  );
};

export default Feed;
