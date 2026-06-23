"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCommentsByEvent(eventId: number) {
  return await prisma.comment.findMany({
    where: { event_id: eventId },
    include: {
      user: {
        select: { first_name: true, last_name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createComment(eventId: number, content: string) {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, message: "Not logged in" };
    }

    if (!content.trim()) {
      return { success: false, message: "Comment cannot be empty" };
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        user_id: session.userId,
        event_id: eventId,
      },
      include: {
        user: {
          select: { first_name: true, last_name: true },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/events");   
    revalidatePath(`/events/${eventId}`);

    return { success: true, data: comment };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to post comment" };
  }
}