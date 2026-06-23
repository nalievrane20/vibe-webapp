// components/latest-posts.tsx
import Image from "next/image";
import { Card } from "@/components/ui/card";

export default function LatestPosts({events}: any) {

  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(b.event_date).getTime() -
      new Date(a.event_date).getTime()
  );

  const latestPosts = sortedEvents.slice(0, 3);
  const olderPosts = sortedEvents.slice(3, 6);

  return (
    <section className="w-full bg-white">
      <div className="container mx-auto">
        <hr className="mt-0" />

        <div className="grid grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto gap-10 py-10 px-4">

        {/* ABOUT */}
        <div>
          <h6 className="font-bold text-sm mb-3">ABOUT</h6>
          <hr className="mb-5" />

          <Card className="overflow-hidden p-0 relative h-64">
            <Image
              src="/school.jpg"
              alt="school"
              fill
              className="object-cover"
            />
          </Card>

          <p className="mt-4 text-sm text-muted-foreground">
            A progressive institution providing quality education and practical learning for student success.
          </p>
        </div>

          {/* LATEST POSTS */}
          <div>
            <h6 className="font-bold text-sm mb-3">LATEST POSTS</h6>
            <hr className="mb-5" />

            <div className="space-y-4">
              {latestPosts.map((post) => (
                <Card key={post.id} className="p-4">
                  <p className="font-medium text-sm">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                  {new Date(post.event_date).toLocaleDateString()}
                </p>
                </Card>
              ))}
            </div>
          </div>

          {/* OLDER POSTS */}
          <div>
            <h6 className="font-bold text-sm mb-3">OLDER POSTS</h6>
            <hr className="mb-5" />

            <div className="space-y-4">
              {olderPosts.map((post) => (
                <Card key={post.id} className="p-4">
                  <p className="font-medium text-sm">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                  {new Date(post.event_date).toLocaleDateString()}
                 </p>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}