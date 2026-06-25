"use server";

import { AttendanceMode } from "@/generated/prisma/enums";
import { getSession } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/paymongo";
import prisma from "@/lib/prisma";

export async function registerForEvent(eventId: number, mode: AttendanceMode) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "You must be logged in to join an event." };
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return { success: false, error: "Event not found." };

  const existing = await prisma.eventRegistration.findUnique({
    where: { event_id_user_id: { event_id: eventId, user_id: session.userId } },
  });

  if (existing?.status === "PAID") {
    return { success: false, error: "You're already registered for this event." };
  }

  const amount = event.fee ?? 0;
  const isFree = !amount || amount <= 0;

  const registration = await prisma.eventRegistration.upsert({
    where: { event_id_user_id: { event_id: eventId, user_id: session.userId } },
    update: { mode, amount, status: isFree ? "PAID" : "PENDING" },
    create: {
      event_id: eventId,
      user_id: session.userId,
      mode,
      amount,
      status: isFree ? "PAID" : "PENDING",
    },
  });

  if (isFree) {
    return { success: true, free: true };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // 👇 this is the part that changed — wrapped in try/catch
  let checkoutId: string, checkoutUrl: string;
  try {
    const result = await createCheckoutSession({
      amount,
      description: `${event.title} (${mode})`,
      referenceNumber: `EVT-${eventId}-${registration.id}`,
      successUrl: `${baseUrl}/events/${eventId}/success?reg=${registration.id}`,
      cancelUrl: `${baseUrl}/events/${eventId}?canceled=1`,
      customerEmail: user!.email,
      customerName: `${user!.first_name} ${user!.last_name}`,
    });
    checkoutId = result.checkoutId;
    checkoutUrl = result.checkoutUrl;
  } catch (err) {
    console.error(err);
    return { success: false, error: "Couldn't start payment. Please try again." };
  }

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { paymongo_checkout_id: checkoutId },
  });

  return { success: true, free: false, checkoutUrl };
}

export async function getMyRegistration(eventId: number) {
  const session = await getSession();
  if (!session?.userId) return null;

  return prisma.eventRegistration.findUnique({
    where: { event_id_user_id: { event_id: eventId, user_id: session.userId } },
  });
}

export async function getEventsRegistrationSummary() {
  return prisma.event.findMany({
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: {
      event_date: "desc",
    },
  });
}

export async function getRegistrationEvents() {
  return prisma.event.findMany({
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: {
      event_date: "desc",
    },
  });
}

export async function getEventRegistrants(eventId: number) {
  return prisma.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      registrations: {
        include: {
          user: {
            include: {
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}