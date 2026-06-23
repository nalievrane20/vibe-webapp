"use server";

import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function getChatChannels() {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, message: "Unauthorized", data: [] };
  }

  const isAdmin = user.role === "ADMIN";

  const channels = await prisma.chatChannel.findMany({
    where: isAdmin
      ? undefined // admins see every channel, no filtering
      : {
          OR: [
            { type: "GENERAL" },
            ...(user.course_id ? [{ course_id: user.course_id }] : []),
          ],
        },
    include: { course: { select: { title: true } } },
    orderBy: { id: "asc" },
  });

  const data = channels.map((c) => ({
    id: c.id,
    type: c.type,
    course_id: c.course_id,
    name: c.type === "GENERAL" ? "General" : c.course?.title ?? "Course",
  }));

  return { success: true, data };
}

async function checkAccess(
  user: { role: string; course_id: number | null },
  channelId: number
) {
  const channel = await prisma.chatChannel.findUnique({
    where: { id: channelId },
  });
  if (!channel) return false;

  if (user.role === "ADMIN") return true; // admins can read/post anywhere

  return channel.type === "GENERAL" || channel.course_id === user.course_id;
}

export async function getChatMessages(channelId: number) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, message: "Unauthorized", data: [] };
  }

  const allowed = await checkAccess(user, channelId);
  if (!allowed) {
    return { success: false, message: "Forbidden", data: [] };
  }

  const messages = await prisma.message.findMany({
    where: { channel_id: channelId },
    include: {
      sender: { select: { id: true, first_name: true, last_name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return { success: true, data: messages };
}

export async function sendChatMessage(channelId: number, content: string) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { success: false, message: "Message cannot be empty" };
  }

  const allowed = await checkAccess(user, channelId);
  if (!allowed) {
    return { success: false, message: "Forbidden" };
  }

  try {
    const message = await prisma.message.create({
      data: {
        channel_id: channelId,
        content: trimmed,
        sender_id: user.id,
      },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true } },
      },
    });

    return { success: true, data: message };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to send message" };
  }
}