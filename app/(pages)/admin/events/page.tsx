import { getEvents } from "@/app/actions/admin/event";
import { getCourses } from "@/app/actions/admin/course";
import { EventTable } from "@/components/pages/admin/events/event-table";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [events, courses] = await Promise.all([getEvents(), getCourses()]);

  return (
    <div>
      <EventTable data={events} courses={courses} />
    </div>
  );
}
