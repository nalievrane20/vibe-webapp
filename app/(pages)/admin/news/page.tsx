import { getNews } from "@/app/actions/admin/news";
import { NewsTable } from "@/components/pages/admin/news/news-table";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div>
      <NewsTable data={news} />
    </div>
  );
}