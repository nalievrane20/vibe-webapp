import { getEventRegistrants } from "@/app/actions/admin/registration";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function EventRegistrantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await getEventRegistrants(Number(id));

  if (!event) {
    return (
      <div className="p-5">
        Event not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 px-5">
      <div>
        <h1 className="text-2xl font-bold">
          {event.title}
        </h1>

        <div className="mt-2 text-sm text-muted-foreground space-y-1">
          <p>
            Event Type:{" "}
            {event.fee && event.fee > 0
              ? `₱${event.fee}`
              : "Free"}
          </p>

          <p>
            Total Registrants: {event.registrations.length}
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {event.registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell>
                  {registration.user.student_id}
                </TableCell>

                <TableCell>
                  {registration.user.first_name}{" "}
                  {registration.user.last_name}
                </TableCell>

                <TableCell>
                  {registration.user.email}
                </TableCell>

                <TableCell>
                  {registration.user.course?.title ?? "N/A"}
                </TableCell>

                <TableCell>
                  {registration.mode}
                </TableCell>

                <TableCell>
                  {registration.status}
                </TableCell>
              </TableRow>
            ))}

            {event.registrations.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center"
                >
                  No registrations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}