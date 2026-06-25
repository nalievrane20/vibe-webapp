import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import QRCode from "qrcode";
import TicketDownload from "@/components/pages/guest/ticket-download";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);

  if (!id || isNaN(eventId)) {
    return notFound();
  }

  const session = await getSession();
  if (!session) redirect("/login");

  const registration = await prisma.eventRegistration.findFirst({
    where: {
      event_id: eventId, // ← change this
      user_id: session.userId,
    },
    include: {
      event: true,
      user: true,
    },
  });

  if (!registration) return notFound();
  if (session.userId !== registration.user_id) return notFound();

  const ticketNumber = `EVT-${registration.event_id}-${registration.id}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrValue = `${baseUrl}/events/verify/${registration.id}`;
  const qrCode = await QRCode.toDataURL(qrValue);

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <div className="border rounded-xl p-6 shadow space-y-4">
        <h1 className="text-2xl font-bold text-center">Event Ticket</h1>

        <div className="space-y-2 text-sm text-center">
          <p>
            <strong>Event:</strong> {registration.event.title}
          </p>
          <p>
            <strong>Student:</strong> {registration.user.first_name}{" "}
            {registration.user.last_name}
          </p>
          <p>
            <strong>Mode:</strong> {registration.mode}
          </p>
          <p>
            <strong>Status:</strong> {registration.status}
          </p>
          <p>
            <strong>Ticket #:</strong> {ticketNumber}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(registration.event.event_date).toLocaleDateString()}
          </p>
        </div>

        <div className="flex justify-center">
          <Image src={qrCode} alt="Ticket QR" width={220} height={220} />
        </div>

        <TicketDownload
          qrCode={qrCode}
          ticketNumber={ticketNumber}
          eventTitle={registration.event.title}
          studentName={`${registration.user.first_name} ${registration.user.last_name}`}
          mode={registration.mode}
          status={registration.status}
          eventDate={registration.event.event_date.toISOString()}
        />
      </div>
    </div>
  );
}
