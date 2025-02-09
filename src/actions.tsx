"use server";

import { auth } from "@clerk/nextjs/server";
import { imagekit } from "./utils";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { UploadResponse } from "imagekit/dist/libs/interfaces";

export const shareAction = async (
  formData: FormData,
  settings: { type: "original" | "wide" | "square"; sensitive: boolean }
) => {
  const file = formData.get("file") as File;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const transformation = `w-600,${
    settings.type === "square"
      ? "ar-1-1"
      : settings.type === "wide"
      ? "ar-16-9"
      : ""
  }`;

  imagekit.upload(
    {
      file: buffer,
      fileName: file.name,
      folder: "/posts",
      ...(file.type.includes("image") && {
        transformation: {
          pre: transformation,
        },
      }),
      customMetadata: {
        sensitive: settings.sensitive,
      },
    },
    function (error, result) {
      if (error) console.log(error);
      else console.log(result);
    }
  );
};

export const likeAction = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) return;

  const existingLike = await prisma.like.findFirst({
    where: {
      userId: userId,
      postId: postId,
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.like.create({
      data: { userId, postId },
    });
  }
};

export const rePostAction = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) return;

  const existingRePost = await prisma.post.findFirst({
    where: {
      userId: userId,
      rePostId: postId,
    },
  });

  if (existingRePost) {
    await prisma.post.delete({
      where: { id: existingRePost.id },
    });
  } else {
    await prisma.post.create({
      data: { userId, rePostId: postId },
    });
  }
};

export const saveAction = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) return;

  const existingSave = await prisma.savedPost.findFirst({
    where: {
      userId: userId,
      postId: postId,
    },
  });

  if (existingSave) {
    await prisma.savedPost.delete({
      where: { id: existingSave.id },
    });
  } else {
    await prisma.savedPost.create({
      data: { userId, postId },
    });
  }
};

export const addComment = async (
  prevState: { success: boolean; error: boolean },
  formData: FormData
) => {
  const { userId } = await auth();

  if (!userId) return { success: false, error: true };

  const parentPostId = formData.get("postId");
  const desc = formData.get("desc");
  const username = formData.get("username");

  if (!parentPostId || !desc) {
    return { success: false, error: true };
  }

  try {
    await prisma.post.create({
      data: {
        userId,
        desc: desc as string,
        parentPostId: Number(parentPostId),
      },
    });
    revalidatePath(`/${username}/status/${parentPostId}`);
    return { success: true, error: false };
  } catch (error) {
    console.log("error from comment", error);
    return { success: false, error: true };
  }
};

export const addPost = async (
  prevState: { success: boolean; error: boolean },
  formData: FormData
) => {
  const { userId } = await auth();

  if (!userId) return { success: false, error: true };

  const desc = formData.get("desc");
  const file = formData.get("file") as File;
  const imgType = formData.get("imgType");
  const isSensitive = formData.get("isSensitive");

  console.log("sensitive =>", isSensitive);

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const transformation = `w-600,${
      imgType === "square" ? "ar-1-1" : imgType === "wide" ? "ar-16-9" : ""
    }`;

    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: buffer,
          fileName: file.name,
          folder: "/posts",
          ...(file.type.includes("image") && {
            transformation: {
              pre: transformation,
            },
          }),
        },
        function (error, result) {
          if (error) reject(error);
          else resolve(result as UploadResponse);
        }
      );
    });
  };

  let img = "";
  let video = "";
  let imgHeight = 0;

  if (file.size) {
    const result: UploadResponse = await uploadFile(file);
    if (result.fileType === "image") {
      img = result.filePath;
      imgHeight = result.height;
    } else {
      video = result.filePath;
    }
  }

  try {
    await prisma.post.create({
      data: {
        userId,
        desc: desc as string,
        img,
        video,
        imgHeight,
      },
    });
    revalidatePath(`/`);
    return { success: true, error: false };
  } catch (error) {
    console.log("error from post", error);
    return { success: false, error: true };
  }
};

export const followUser = async (targetUserId: string) => {
  const { userId } = await auth();

  if (!userId) return;

  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId: userId,
      followingId: targetUserId,
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
  } else {
    await prisma.follow.create({
      data: { followerId: userId, followingId: targetUserId },
    });
  }
};
