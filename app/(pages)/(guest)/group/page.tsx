import { getEventsWithEngagement } from "@/app/actions/admin/event";
import { getPublicNews } from "@/app/actions/admin/news";
import { getAuthUser } from "@/lib/auth";
import GroupChat from "@/components/pages/guest/group-chat";
import LatestPosts from "@/components/pages/guest/latest-post";
import { NewsCarousel } from "@/components/pages/guest/news-carousel";

export const dynamic = "force-dynamic";

export default async function Group() {
  const user = await getAuthUser();
  const { events } = await getEventsWithEngagement(user?.id);
  const news = await getPublicNews();

  return (
    <div>
      <NewsCarousel news={news} />
      <GroupChat user={user} />
      <LatestPosts events={events} />
      <footer />
    </div>
  );
}
