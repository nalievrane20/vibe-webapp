import { notFound } from "next/navigation";
import { getEventByIdWithEngagement } from "@/app/actions/admin/event";
import { getCommentsByEvent } from "@/app/actions/admin/comment";
import { registerForEvent, getMyRegistration } from "@/app/actions/admin/registration";
import { getSession } from "@/lib/auth";
import EventLikeButton from "@/components/pages/guest/event-like-button";
import EventComments from "@/components/pages/guest/event-comments";
import EventRegistration from "@/components/pages/guest/event-registration";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);

  if (Number.isNaN(eventId)) notFound();

  const session = await getSession();

  const [event, comments, myRegistration] = await Promise.all([
    getEventByIdWithEngagement(eventId, session?.userId),
    getCommentsByEvent(eventId),
    getMyRegistration(eventId),
  ]);

  if (!event) notFound();

    console.log("EVENT DEBUG:", {
      id: event.id,
      fee: event.fee,
    });

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      {event.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.image}
          alt={event.title}
          className="mb-6 h-72 w-full rounded-xl object-cover"
        />
      )}

      <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {new Date(event.event_date).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {event.description && (
        <p className="mt-4 whitespace-pre-line text-gray-700">{event.description}</p>
      )}

      <div className="mt-6 border-gray-100 pt-4 mb-20">
        <EventRegistration
          eventId={event.id}
          fee={event.fee ?? undefined}
          isLoggedIn={!!session?.userId}
          existingStatus={myRegistration?.status}
        />
      </div>

      {/* <div className="mt-6 border-t border-gray-100 pt-4">
        <EventLikeButton
          eventId={event.id}
          initialLiked={event.likedByMe}
          initialCount={event.likeCount}
        />
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <EventComments eventId={event.id} initialComments={comments} />
      </div> */}
    </article>
  );
}