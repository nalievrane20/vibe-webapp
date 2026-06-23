"use server";

import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function getChatChannels() {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, message: "Unauthorized", data: [] };
  }

  const orConditions: Array<Record<string, unknown>> = [{ type: "GENERAL" }];
  if (user.course_id) {
    orConditions.push({ course_id: user.course_id });
  }

  const channels = await prisma.chatChannel.findMany({
    where: { OR: orConditions },
    include: { course: { select: { title: true } } },
    orderBy: { id: "asc" },
  });

  const data = channels.map((c:any) => ({
    id: c.id,
    type: c.type,
    course_id: c.course_id,
    name: c.type === "GENERAL" ? "General" : c.course?.title ?? "Course",
  }));

  return { success: true, data };
}

async function checkAccess(userCourseId: number | null, channelId: number) {
  const channel = await prisma.chatChannel.findUnique({
    where: { id: channelId },
  });

  if (!channel) return false;

  return channel.type === "GENERAL" || channel.course_id === userCourseId;
}

export async function getChatMessages(channelId: number) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, message: "Unauthorized", data: [] };
  }

  const allowed = await checkAccess(user.course_id, channelId);
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

  const allowed = await checkAccess(user.course_id, channelId);
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