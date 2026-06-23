"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateEventInput {
  title: string;
  description?: string;
  image?: string;
  eventDate: Date;
  courseIds: number[];

  fee?: number | null;
}

interface UpdateEventInput {
  id: number;
  title: string;
  description?: string;
  image?: string;
  eventDate: Date;
  courseIds: number[];

  fee?: number | null;
}

export async function createEvent(data: CreateEventInput) {
  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        event_date: data.eventDate,

        fee: data.fee ?? null, 

        courses: {
          connect: data.courseIds.map((id) => ({ id })),
        },
      },
      include: {
        courses: true,
      },
    });

    revalidatePath("/admin/events");

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to create event",
    };
  }
}

export async function getEvents() {
  return await prisma.event.findMany({
    include: {
      courses: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getEventById(id: number) {
  return await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      courses: true,
    },
  });
}

export async function updateEvent(data: UpdateEventInput) {
  try {
    const event = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        event_date: data.eventDate,

        fee: data.fee ?? null, 

        courses: {
          set: data.courseIds.map((id) => ({ id })),
        },
      },
      include: {
        courses: true,
      },
    });

    revalidatePath("/admin/events");

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to update event",
    };
  }
}

export async function deleteEvent(id: number) {
  try {
    await prisma.event.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/events");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to delete event",
    };
  }
}

const EVENTS_PAGE_SIZE = 6;

export async function getEventsWithEngagement(
  userId?: number,
  page = 1,
  limit = EVENTS_PAGE_SIZE
) {
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      include: {
        courses: true,
        _count: {
          select: { likes: true, comments: true },
        },
        likes: userId
          ? { where: { user_id: userId }, select: { id: true } }
          : false,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.event.count(),
  ]);

  const mapped = events.map((event: any) => ({
    ...event,
    likeCount: event._count.likes,
    commentCount: event._count.comments,
    likedByMe: userId ? event.likes.length > 0 : false,
  }));

  return {
    events: mapped,
    hasMore: skip + events.length < total,
    total,
  };
}

export async function getEventByIdWithEngagement(id: number, userId?: number) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      courses: true,
      _count: {
        select: { likes: true, comments: true },
      },
      likes: userId
        ? { where: { user_id: userId }, select: { id: true } }
        : false,
    },
  });

  if (!event) return null;

  return {
    ...event,
    likeCount: event._count.likes,
    commentCount: event._count.comments,
    likedByMe: userId ? event.likes.length > 0 : false,
  };
}

export async function getPopularEvents(limit = 6) {
  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

  const mapped = events.map((event: any) => ({
    ...event,
    likeCount: event._count.likes,
    commentCount: event._count.comments,
    engagementScore: event._count.likes + event._count.comments,
  }));

  return mapped
    .sort((a: typeof mapped[number], b: typeof mapped[number]) => b.engagementScore - a.engagementScore)
    .slice(0, limit);
}