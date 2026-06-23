"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getNotifications() {
  const session = await getSession();
  if (!session) return [];

  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      event_date: true,
      createdAt: true,
      notificationReads: {
        where: { user_id: session.userId },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20, // keep the dropdown short
  });

  return events.map((event: any) => ({
    id: event.id,
    title: event.title,
    event_date: event.event_date,
    isRead: event.notificationReads.length > 0,
  }));
}

export async function markNotificationRead(eventId: number) {
  const session = await getSession();
  if (!session) return { success: false };

  await prisma.notificationRead.upsert({
    where: {
      user_id_event_id: { user_id: session.userId, event_id: eventId },
    },
    update: {},
    create: { user_id: session.userId, event_id: eventId },
  });

  return { success: true };
}