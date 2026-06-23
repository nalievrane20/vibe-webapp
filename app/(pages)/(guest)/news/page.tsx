import { getEvents } from '@/app/actions/admin/event'
import AllNews from '@/components/pages/guest/all-news'
import Footer from '@/components/pages/guest/footer'
import LatestPosts from '@/components/pages/guest/latest-post'
import { NewsCarousel } from '@/components/pages/guest/news-carousel'
import { getPublicNews } from '@/app/actions/admin/news'

export const dynamic = "force-dynamic";

export default async function News() {
  const events = await getEvents()
  const news = await getPublicNews()

  return (
    <div>
        <NewsCarousel news={news} />
        <AllNews news={news} />
        <LatestPosts events={events}/>
        <Footer/>
    </div>
  )
}
