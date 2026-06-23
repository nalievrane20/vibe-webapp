"use client";

import { useState, useTransition, useRef } from "react";
import { createComment } from "@/app/actions/admin/comment";

interface CommentUser {
  first_name: string;
  last_name: string;
}

interface CommentItem {
  id: number;
  content: string;
  createdAt: string | Date;
  user: CommentUser;
}

interface EventCommentsProps {
  eventId: number;
  initialComments: CommentItem[];
}

function initialsOf(user: CommentUser) {
  return `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();
}

export default function EventComments({
  eventId,
  initialComments,
}: EventCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    const content = (formData.get("content") as string)?.trim();
    if (!content) return;

    setError(null);

    startTransition(async () => {
      const result = await createComment(eventId, content);

      if (!result.success || !result.data) {
        setError(
          result.message === "Not logged in"
            ? "Log in to leave a comment"
            : result.message ?? "Couldn't post comment, try again"
        );
        return;
      }

      setComments((prev) => [result.data, ...prev]);
      formRef.current?.reset();
    });
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      <form ref={formRef} action={handleSubmit} className="mt-3 flex gap-3">
        <input
          type="text"
          name="content"
          placeholder="Write a comment..."
          maxLength={500}
          disabled={isPending}
          className="flex-1 rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          Post
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <ul className="mt-5 space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">
            No comments yet — be the first to say something.
          </p>
        ) : (
          comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {initialsOf(comment.user)}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.user.first_name} {comment.user.last_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-700">{comment.content}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}