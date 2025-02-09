import Link from "next/link";
import Image from "./Image";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma";

const Recommendations = async () => {
  const { userId } = await auth();

  const followingIds = await prisma.follow.findMany({
    where: {
      followerId: userId!,
    },
    select: {
      followingId: true,
    },
  });

  const followedUsers = followingIds.map((follow) => follow.followingId);

  const friendRecommendations = await prisma.user.findMany({
    where: {
      id: {
        notIn: followedUsers,
        not: userId!,
      },
      following: {
        some: {
          followerId: {
            in: followedUsers,
          },
        },
      },
    },
    take: 3,
    select: {
      id: true,
      displayName: true,
      username: true,
      img: true,
    },
  });

  return (
    <div className="p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4">
      {/* USER CARD */}

      {friendRecommendations.map((f) => (
        <div key={f.id} className="flex items-center justify-between">
          {/* IMAGE AND USER INFO */}
          <div className="flex items-center gap-2">
            <div className="relative rounded-full overflow-hidden w-10 h-10">
              <Image
                path={f.img || "general/avatar.png"}
                alt="John Doe"
                w={100}
                h={100}
                tr={true}
              />
            </div>
            <div>
              <h1 className="text-md font-bold">{f.displayName}</h1>
              <span className="text-textGray text-sm">@{f.username}</span>
            </div>
          </div>
          {/* BUTTON */}
          <button className="py-1 px-4 font-semibold bg-white text-black rounded-full">
            Follow
          </button>
        </div>
      ))}

      <Link href="/" className="text-iconBlue">
        Show More
      </Link>
    </div>
  );
};

export default Recommendations;
