"use server";

import prisma from "@/lib/prisma";

function buildMonthlySeries<T>(
  items: T[],
  getDate: (item: T) => Date,
  apply: (current: number, item: T) => number
) {
  const map = new Map<string, { sortKey: string; label: string; value: number }>();

  for (const item of items) {
    const date = getDate(item);
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    const existing = map.get(sortKey) ?? { sortKey, label, value: 0 };
    existing.value = apply(existing.value, item);
    map.set(sortKey, existing);
  }

  return Array.from(map.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, value }) => ({ label, value }));
}

export async function getAnalyticsOverview() {
  const [
    totalUsers,
    totalEvents,
    totalNews,
    totalRegistrations,
    totalLikes,
    totalComments,
    users,
    courses,
    events,
    registrations,
    news,
    usersWithoutCourse,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.news.count(),
    prisma.eventRegistration.count(),
    prisma.like.count(),
    prisma.comment.count(),
    prisma.user.findMany({ select: { createdAt: true } }),
    prisma.course.findMany({
      select: {
        title: true,
        _count: { select: { users: true } },
      },
      orderBy: { title: "asc" },
    }),
    prisma.event.findMany({
      select: {
        title: true,
        _count: { select: { likes: true, comments: true, registrations: true } },
      },
    }),
    prisma.eventRegistration.findMany({
      select: { amount: true, status: true, createdAt: true },
    }),
    prisma.news.findMany({ select: { createdAt: true } }),
    prisma.user.count({ where: { course_id: null } }),
  ]);

  const totalRevenue = registrations
    .filter((r) => r.status === "PAID")
    .reduce((sum, r) => sum + r.amount, 0);

  const signupTrend = buildMonthlySeries(
    users,
    (u) => u.createdAt,
    (count) => count + 1
  );

  const revenueTrend = buildMonthlySeries(
    registrations.filter((r) => r.status === "PAID"),
    (r) => r.createdAt,
    (sum, r) => sum + r.amount
  );

  const newsTrend = buildMonthlySeries(
    news,
    (n) => n.createdAt,
    (count) => count + 1
  );

  const usersPerCourse = [
    ...courses.map((c) => ({ name: c.title, users: c._count.users })),
    ...(usersWithoutCourse > 0 ? [{ name: "No course", users: usersWithoutCourse }] : []),
  ];

  const eventEngagement = events
    .map((e) => ({
      title: e.title,
      likes: e._count.likes,
      comments: e._count.comments,
      registrations: e._count.registrations,
      total: e._count.likes + e._count.comments,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const registrationStatusCounts = [
    { name: "Paid", value: registrations.filter((r) => r.status === "PAID").length },
    { name: "Pending", value: registrations.filter((r) => r.status === "PENDING").length },
    { name: "Failed", value: registrations.filter((r) => r.status === "FAILED").length },
  ];

  return {
    stats: {
      totalUsers,
      totalEvents,
      totalNews,
      totalRegistrations,
      totalRevenue,
      totalEngagement: totalLikes + totalComments,
    },
    signupTrend,
    revenueTrend,
    newsTrend,
    usersPerCourse,
    eventEngagement,
    registrationStatusCounts,
  };
}