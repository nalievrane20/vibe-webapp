import { getEvents } from '@/app/actions/admin/event'
import LatestPosts from '@/components/pages/guest/latest-post'
import { NewsCarousel } from '@/components/pages/guest/news-carousel'
import UserProfile from '@/components/pages/guest/user-profile'
import { getPublicNews } from '@/app/actions/admin/news'

export const dynamic = "force-dynamic";

export default async function Profile() {
  const events = await getEvents()
  const news = await getPublicNews()

  return (
    <div>
        <NewsCarousel news={news} />
        <UserProfile/>
        <LatestPosts events={events}/>
        <footer/>
    </div>
  )
}
