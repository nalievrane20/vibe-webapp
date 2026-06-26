"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Registration = {
  id: number;
  eventId: number;
  qrCode: string;
  ticketNumber: string;
  eventTitle: string;
  eventDate: string;
  eventDescription: string;
  eventImage: string | null;
  mode: string;
  status: string;
};

type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  course: string;
};

export default function UserProfile({
  user,
  registrations,
}: {
  user: UserData;
  registrations: Registration[];
}) {
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="shrink-0">
            <Image
              src="/avatar.jpg"
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full border-4 border-black object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h4 className="text-xl font-semibold">
              {user.firstName} {user.lastName}
            </h4>
            <p className="text-sm text-muted-foreground">Student</p>
            <small className="text-sm text-muted-foreground">
              {user.course}
            </small>
            <small className="text-sm text-muted-foreground">
              {user.email}
            </small>
          </div>
          <div className="ml-auto">
            <Button size="sm">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">My Registered Events</h2>

        {registrations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              You haven't joined any events yet.
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium w-[280px]">
                    Event
                  </th>
                  <th className="text-left px-4 py-3 font-medium w-[120px]">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium w-[90px]">
                    Mode
                  </th>
                  <th className="text-left px-4 py-3 font-medium w-[120px]">
                    Ticket #
                  </th>
                  <th className="text-left px-4 py-3 font-medium w-[90px]">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium w-[200px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {registrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {reg.eventImage ? (
                          <img
                            src={reg.eventImage}
                            alt={reg.eventTitle}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center text-xl">
                            🎟
                          </div>
                        )}
                        <div>
                          <p className="font-medium leading-tight">
                            {reg.eventTitle}
                          </p>
                          {reg.eventDescription && (
                            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2 max-w-xs">
                              {reg.eventDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(reg.eventDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {reg.mode}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                      {reg.ticketNumber}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/events/ticket/${reg.eventId}`)
                          }
                        >
                          View Ticket
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
