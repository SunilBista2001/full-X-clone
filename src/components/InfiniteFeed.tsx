"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "./Post";

const fetchPosts = async (pageParam: number, userProfileId?: string) => {
  const res = await fetch(
    `/api/posts?userProfileId=${userProfileId}&page=${pageParam}`
  );
  return res.json();
};

const InfiniteFeed = ({ userProfileId }: { userProfileId?: string }) => {
  const { data, fetchNextPage, hasNextPage, error, status } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 2 }) => fetchPosts(pageParam, userProfileId),
    initialPageParam: 2,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 2 : undefined,
  });

  if (status === "pending") return "Loading...";

  if (error) return "An error has occurred: ";

  const allPosts = data ? data?.pages.map((page) => page.posts).flat() : [];

  return (
    <InfiniteScroll
      dataLength={data.pages.length}
      next={fetchNextPage}
      hasMore={hasNextPage}
      loader={
        <p style={{ textAlign: "center", padding: "4px" }}>
          <b>Loading More Posts...</b>
        </p>
      }
      endMessage={
        <p style={{ textAlign: "center", padding: "4px" }}>
          <b>Yay! You have seen it all</b>
        </p>
      }
    >
      {allPosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </InfiniteScroll>
  );
};

export default InfiniteFeed;
