"use client";

import React, { useEffect, useState } from "react";
import Image from "./Image";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";

type NotificationType = {
  id: string;
  senderUsername: string;
  receiverUsername: string;
  action: "liked" | "rePost" | "comment" | "follow";
  link: string;
};

function Notification() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    socket.on("getNotification", (data: NotificationType) => {
      setNotifications((prev) => [...prev, data]);
    });
  }, []);

  const handleClick = (notification: NotificationType) => {
    const filteredLists = notifications.filter((n) => n.id !== notification.id);
    setNotifications(filteredLists);
    setOpen(false);
    router.push(notification.link);
  };

  return (
    <div className="relative mb-4 z-50">
      <div
        className="cursor-pointer p-2 rounded-full hover:bg-[#181818] flex items-center gap-4"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="relative">
          <Image path={`icons/notification.svg`} alt="" w={24} h={24} />

          {notifications.length > 0 && (
            <span className="absolute -top-4 -right-4 w-6 h-6 bg-iconBlue p-2 rounded-full flex items-center justify-center text-sm">
              {notifications.length}
            </span>
          )}
        </div>
        <span className="hidden xxl:inline">Notifications</span>
      </div>
      {open && notifications.length > 0 && (
        <div className="absolute -right-full p-4 rounded-lg bg-white text-black flex flex-col gap-4 w-max">
          <h1 className="text-xl text-textGray">Notifications</h1>
          {notifications?.map((n) => (
            <div
              onClick={() => handleClick(n)}
              key={n.id}
              className="cursor-pointer"
            >
              <b>{n.senderUsername}</b>{" "}
              {n.action === "liked"
                ? "liked your post"
                : n.action === "comment"
                ? "commented on your post"
                : n.action === "rePost"
                ? "reposted your post"
                : "followed you"}
            </div>
          ))}
          <button
            onClick={() => {
              setNotifications([]);
              setOpen(false);
            }}
            className="bg-black text-white p-2 text-sm rounded-lg"
          >
            Mark as read
          </button>
        </div>
      )}
    </div>
  );
}

export default Notification;
