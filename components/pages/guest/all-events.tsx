"use client";

// components/events-section.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { toggleLike } from "@/app/actions/admin/like";
import { createComment, getCommentsByEvent } from "@/app/actions/admin/comment";

type AllEventsUser = {
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

export default function AllEvents({
  events,
  user,
}: {
  events: any;
  user?: AllEventsUser;
}) {
  const router = useRouter();

  const [likeState, setLikeState] = useState<
    Record<number, { liked: boolean; count: number }>
  >({});

  const [commentCountState, setCommentCountState] = useState<
    Record<number, number>
  >({});

  const [pending, startTransition] = useTransition();

  const [commentDialogEventId, setCommentDialogEventId] = useState<
    number | null
  >(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const getLikeInfo = (event: any) => {
    if (likeState[event.id]) return likeState[event.id];
    return { liked: !!event.likedByMe, count: event.likeCount ?? 0 };
  };

  const getCommentCount = (event: any) => {
    if (commentCountState[event.id] !== undefined)
      return commentCountState[event.id];
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
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <section className="w-full bg-muted/40 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold mb-10">ALL EVENTS</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto gap-10 py-10 px-4">
          {events.map((event: any) => {
            const likeInfo = getLikeInfo(event);

            return (
              <Card key={event.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <img
                    src={event.image}
                    alt={event.title}
                    className="rounded-md mb-3 h-40 w-full object-cover"
                  />
                  <CardTitle className="text-xl line-clamp-1">
                    {event.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  <p className="text-xs mt-2">
                    Date: {new Date(event.event_date).toLocaleDateString()}
                  </p>
                  <Button
                    className="w-full mt-3"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    Join Event
                  </Button>

                  {/* LIKE / COMMENT / SHARE ROW */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => handleLike(event)}
                      disabled={!user}
                      className={`flex items-center gap-1.5 text-sm ${
                        likeInfo.liked
                          ? "text-red-500"
                          : "text-muted-foreground"
                      } hover:text-red-500 disabled:opacity-50`}
                    >
                      <Heart
                        className="h-4 w-4"
                        fill={likeInfo.liked ? "currentColor" : "none"}
                      />
                      {likeInfo.count}
                    </button>

                    <button
                      type="button"
                      onClick={() => openComments(event.id)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {getCommentCount(event)}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(event)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Share2 className="h-4 w-4" />
                      {/* Share */}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* COMMENT DIALOG */}
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
                <p className="text-sm text-muted-foreground">
                  Loading comments...
                </p>
              )}

              {!loadingComments && comments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No comments yet.
                </p>
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
    </section>
  );
}
