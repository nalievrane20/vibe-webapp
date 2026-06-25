"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  const [
    totalUsers,
    totalEvents,
    totalRegistrations,
    totalNews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.eventRegistration.count(),
    prisma.news.count(),
  ]);

  return {
    totalUsers,
    totalEvents,
    totalRegistrations,
    totalNews,
  };
}