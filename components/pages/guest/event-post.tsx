"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { toggleLike } from "@/app/actions/admin/like";
import { createComment, getCommentsByEvent } from "@/app/actions/admin/comment";
import { getEventsWithEngagement } from "@/app/actions/admin/event";

type EventPostUser = {
  id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  course?: { title: string } | null;
};

type CommentItem = {
  id: number;
  content: string;
  createdAt: string | Date;
  user: { first_name: string; last_name: string };
};

export default function EventPost({
  initialEvents,
  initialTotal,
  popularEvents,
  archiveMonths,
  eventsCount,
  newsCount,
  user,
}: {
  initialEvents: any[];
  initialTotal: number;
  popularEvents: any[];
  archiveMonths: string[];
  eventsCount: number;
  newsCount: number;
  user?: EventPostUser;
}) {
  const LIMIT = 3;

  const [events, setEvents] = useState<any[]>(initialEvents);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const router = useRouter();

  const [likeState, setLikeState] = useState <
    Record<number, { liked: boolean; count: number }>
  >({});

  const [commentCountState, setCommentCountState] = useState<Record<number, number>>({});

  const [pending, startTransition] = useTransition();

  const [commentDialogEventId, setCommentDialogEventId] = useState<number | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const getLikeInfo = (event: any) => {
    if (likeState[event.id]) return likeState[event.id];
    return { liked: !!event.likedByMe, count: event.likeCount ?? 0 };
  };

  const getCommentCount = (event: any) => {
    if (commentCountState[event.id] !== undefined) return commentCountState[event.id];
    return event.commentCount ?? 0;
  };

  const handleLike = (event: any) => {
    if (!user) return;

    const current = getLikeInfo(event);
    const next = {
      liked: !current.liked,
      count: current.liked ? current.count - 1 : current.count + 1,
    };
    setLikeState((prev) => ({ ...prev, [event.id]: next }));

    startTransition(async () => {
      const res = await toggleLike(event.id);
      if (!res.success) {
        setLikeState((prev) => ({ ...prev, [event.id]: current }));
      }
    });
  };

  const openComments = (eventId: number) => {
    setCommentDialogEventId(eventId);
    setCommentInput("");
    setLoadingComments(true);
    startTransition(async () => {
      const data = await getCommentsByEvent(eventId);
      setComments(data as CommentItem[]);
      setLoadingComments(false);
    });
  };

  const handlePostComment = () => {
    if (!commentDialogEventId || !commentInput.trim()) return;

    startTransition(async () => {
      const res = await createComment(commentDialogEventId, commentInput);
      if (res.success && res.data) {
        setComments((prev) => [res.data as CommentItem, ...prev]);
        setCommentInput("");
      }
    });
  };

  const handleShare = async (event: any) => {
    const url = `${window.location.origin}/events/${event.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
      } catch {
        // user cancelled share, do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const goToPage = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;

    setIsLoading(true);
    startTransition(async () => {
      const res = await getEventsWithEngagement(user?.id, targetPage, LIMIT);
      setEvents(res.events);
      setTotal(res.total);
      setPage(targetPage);
      setIsLoading(false);
    });
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-8 space-y-6">

          <div className="grid md:grid-cols-1 gap-4">
            {events?.map((event: any) => {
              const likeInfo = getLikeInfo(event);

              return (
                <Card key={event.id}>
                  <CardHeader>
                    <img
                      src={event.image}
                      className="rounded-md mb-3 h-80 w-full object-cover"
                    />
                    <h2 className="font-semibold text-lg line-clamp-1">
                      {event.title}
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                    <p className="text-xs mt-2">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-8">
                        <button
                          type="button"
                          onClick={() => handleLike(event)}
                          disabled={!user}
                          className={`flex items-center gap-1.5 text-sm ${
                            likeInfo.liked ? "text-red-500" : "text-muted-foreground"
                          } hover:text-red-500 disabled:opacity-50`}
                        >
                          <Heart
                            className="h-4 w-4"
                            fill={likeInfo.liked ? "currentColor" : "none"}
                          />
                          Like {likeInfo.count}
                        </button>

                        <button
                          type="button"
                          onClick={() => openComments(event.id)}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Comment {getCommentCount(event)}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(event)}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>

                      <Button className="px-8" onClick={() => router.push(`/events/${event.id}`)}>
                        Join Event
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-2 justify-center pt-6">
            <Button
              variant="outline"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1 || isLoading}
            >
              «
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                variant={n === page ? "default" : "outline"}
                onClick={() => goToPage(n)}
                disabled={isLoading}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages || isLoading}
            >
              »
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">

          <Card className="p-4 text-center">
            <Avatar className="mx-auto">
              <AvatarImage src="/images/user.jpg" />
              <AvatarFallback>
                {user
                  ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
                  : "SN"}
              </AvatarFallback>
            </Avatar>

            <h3 className="mt-3 font-semibold">
              {user
                ? [user.first_name, user.middle_name, user.last_name]
                    .filter(Boolean)
                    .join(" ")
                : "Student Name"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {user?.course?.title ?? "Course not set"}
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3">Popular Events</h4>
            <div className="space-y-3">
              {popularEvents.map((event) => (
                <div key={event.id} className="text-sm">
                  <p className="font-medium line-clamp-1">{event.title}</p>
                  <p className="text-muted-foreground text-xs line-clamp-1">
                    {event.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <h4 className="font-semibold">Newsletter</h4>
            <Input placeholder="Username" />
            <Button className="w-full">Sign up</Button>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3">Archive</h4>
            <div className="space-y-1 text-sm">
              {archiveMonths.length > 0 ? (
                archiveMonths.map((month) => <p key={month}>{month}</p>)
              ) : (
                <p className="text-muted-foreground">No events yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3">Categories</h4>

            <div className="flex justify-between">
              <span>Events</span>
              <Badge>{eventsCount}</Badge>
            </div>

            <div className="flex justify-between mt-2">
              <span>News</span>
              <Badge>{newsCount}</Badge>
            </div>
          </Card>

        </div>
      </div>

      <Dialog
        open={commentDialogEventId !== null}
        onOpenChange={(open) => !open && setCommentDialogEventId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="max-h-72 overflow-y-auto space-y-3">
              {loadingComments && (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              )}

              {!loadingComments && comments.length === 0 && (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}

              {!loadingComments &&
                comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <p className="font-medium">
                      {comment.user.first_name} {comment.user.last_name}
                    </p>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={user ? "Write a comment..." : "Log in to comment"}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                disabled={!user}
              />
              <Button onClick={handlePostComment} disabled={!user || pending}>
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}