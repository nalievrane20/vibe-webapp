"use client";

// components/all-news.tsx
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AllNews({news}: any) {

  return (
    <section className="w-full bg-muted/40 py-16">
      <div className="container mx-auto px-4">

        <h2 className="text-center text-3xl font-bold mb-10">
          ALL NEWS
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto gap-10 py-10 px-4">
          {news.map((news: any) => (
            <Card key={news.id} className="hover:shadow-lg transition">

              <CardHeader>
                <img
                  src={news.image_url}
                  alt={news.title}
                  className="rounded-md mb-3 h-40 w-full object-cover"
                />
                <CardTitle className="text-xl line-clamp-1">{news.title}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {news.description}
                </p>

                <p className="text-xs mt-2">
                  Date: {new Date(news.news_date).toLocaleDateString()}
                </p>
                <Button
                  className="w-full mt-3"
                  onClick={() => {
                    console.log("Reading news:", news.id);
                    // later: e.g. router.push(`/news/${item.id}`) or open item.url
                  }}
                >
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}