import { getEvents } from "@/app/actions/admin/event";
import LatestPosts from "@/components/pages/guest/latest-post";
import { NewsCarousel } from "@/components/pages/guest/news-carousel";
import UserProfile from "@/components/pages/guest/user-profile";
import { getPublicNews } from "@/app/actions/admin/news";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const events = await getEvents();
  const news = await getPublicNews();

  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      course: true,
      eventRegistrations: {
        // ← was registrations
        where: { status: "PAID" },
        include: { event: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const registrationsWithQR = await Promise.all(
    user.eventRegistrations.map(async (reg) => ({
      ...reg,
      qrCode: await QRCode.toDataURL(`${baseUrl}/events/verify/${reg.id}`),
      ticketNumber: `EVT-${reg.event_id}-${reg.id}`,
      event_date_iso: reg.event.event_date.toISOString(),
    })),
  );

  return (
    <div>
      <NewsCarousel news={news} />
      <UserProfile
        user={{
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          course: user.course?.title ?? "No course",
        }}
        registrations={registrationsWithQR.map((reg) => ({
          id: reg.id,
          eventId: reg.event_id, // ← make sure this is here
          qrCode: reg.qrCode,
          ticketNumber: reg.ticketNumber,
          eventTitle: reg.event.title,
          eventDate: reg.event_date_iso,
          eventDescription: reg.event.description ?? "",
          eventImage: reg.event.image ?? null,
          mode: reg.mode,
          status: reg.amount === 0 ? "FREE" : reg.status,
        }))}
      />
      <LatestPosts events={events} />
      <footer />
    </div>
  );
}
