import { getEventsWithEngagement } from '@/app/actions/admin/event'
import AllEvents from '@/components/pages/guest/all-events'
import Footer from '@/components/pages/guest/footer'
import LatestPosts from '@/components/pages/guest/latest-post'
import { NewsCarousel } from "@/components/pages/guest/news-carousel";
import { getPublicNews } from '@/app/actions/admin/news'
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Events() {
  const user = await getCurrentUser();
  const { events } = await getEventsWithEngagement(user?.id, 1, 100);
  const news = await getPublicNews();

  return (
    <div>
      <NewsCarousel news={news} />
      <AllEvents events={events} user={user ?? undefined} />
      <LatestPosts events={events} />
      <Footer />
    </div>
  )
}