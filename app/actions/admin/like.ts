"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth"; // adjust path to wherever this file actually lives
import { revalidatePath } from "next/cache";


export async function toggleLike(eventId: number) {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, message: "Not logged in" };
    }

    const existing = await prisma.like.findFirst({
      where: { user_id: session.userId, event_id: eventId },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: { user_id: session.userId, event_id: eventId },
      });
    }

    revalidatePath("/");
    revalidatePath("/events");  
    revalidatePath(`/events/${eventId}`);

    return { success: true, liked: !existing };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to toggle like" };
  }
}