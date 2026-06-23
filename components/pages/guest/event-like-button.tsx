"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/app/actions/admin/like";

interface EventLikeButtonProps {
  eventId: number;
  initialLiked: boolean;
  initialCount: number;
}

export default function EventLikeButton({
  eventId,
  initialLiked,
  initialCount,
}: EventLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => (nextLiked ? c + 1 : c - 1));
    setError(null);

    startTransition(async () => {
      const result = await toggleLike(eventId);

      if (!result.success) {
        // Revert on failure
        setLiked(!nextLiked);
        setCount((c) => (nextLiked ? c - 1 : c + 1));
        setError(
          result.message === "Not logged in"
            ? "Log in to like this event"
            : "Couldn't update like, try again"
        );
        return;
      }

      // Reconcile with server truth in case of race conditions
      setLiked(result.liked ?? nextLiked);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={liked}
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 ${
          liked
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <Heart
          className="h-4 w-4"
          strokeWidth={2}
          fill={liked ? "currentColor" : "none"}
        />
        <span>{liked ? "Liked" : "Like"}</span>
        <span className="text-gray-400">·</span>
        <span>{count}</span>
      </button>

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}