import {
  getEventsWithEngagement,
  getPopularEvents,
} from "@/app/actions/admin/event";
import AllEvents from "@/components/pages/guest/all-events";
import EventPost from "@/components/pages/guest/event-post";
import Footer from "@/components/pages/guest/footer";
import LatestPosts from "@/components/pages/guest/latest-post";
import { NewsCarousel } from "@/components/pages/guest/news-carousel";
import { getPublicNews } from "@/app/actions/admin/news";
import Image from "next/image";
import News from "./news/page";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const { events, total } = await getEventsWithEngagement(user?.id, 1, 3);
  const { events: allEvents } = await getEventsWithEngagement(user?.id, 1, 100);
  const popularEvents = await getPopularEvents(6);
  const news = await getPublicNews();
  const archiveMonths: string[] = Array.from(
    new Set<string>(
      allEvents.map((event: any): string =>
        new Date(event.event_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      ),
    ),
  ).sort(
    (a: string, b: string) =>
      new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime(),
  );

  return (
    <div>
      <NewsCarousel news={news} />
      <EventPost
        initialEvents={events}
        initialTotal={total}
        popularEvents={popularEvents}
        archiveMonths={archiveMonths}
        eventsCount={total}
        newsCount={news.length}
        user={user ?? undefined}
      />
      <LatestPosts events={allEvents} />
      <Footer />
    </div>
  );
}
