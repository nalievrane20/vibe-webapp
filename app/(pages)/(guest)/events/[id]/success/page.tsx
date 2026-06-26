import prisma from "@/lib/prisma";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import TicketDownload from "@/components/pages/guest/ticket-download";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reg?: string }>;
}) {
  const { id } = await params;
  const { reg } = await searchParams;

  const registration = reg
    ? await prisma.eventRegistration.findUnique({
        where: { id: Number(reg) },
        include: { event: true, user: true },
      })
    : null;

  const isPaid = registration?.status === "PAID";

  const qrCode =
    isPaid && registration
      ? await QRCode.toDataURL(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/events/verify/${registration.id}`,
        )
      : null;

  const ticketNumber = registration
    ? `EVT-${registration.event_id}-${registration.id}`
    : null;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">
          {isPaid ? "You're all set!" : "Almost there..."}
        </h1>
        <p className="mt-2 text-gray-600">
          {isPaid
            ? "Your registration is confirmed. We'll see you at the event."
            : "We're confirming your payment — this usually takes a few seconds. Refresh if it doesn't update."}
        </p>
      </div>

      {isPaid && registration && qrCode && (
        <div className="border rounded-xl p-6 shadow space-y-3 mb-6">
          <h2 className="text-lg font-semibold text-center">🎟 Your Ticket</h2>

          <div className="space-y-2 text-sm">
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

          <div className="flex justify-center pt-2">
            <img src={qrCode} alt="Ticket QR" width={180} height={180} />
          </div>

          <TicketDownload
            qrCode={qrCode}
            ticketNumber={ticketNumber!}
            eventTitle={registration.event.title}
            studentName={`${registration.user.first_name} ${registration.user.last_name}`}
            mode={registration.mode}
            status={registration.amount === 0 ? "FREE" : registration.status}
            eventDate={registration.event.event_date.toISOString()}
          />
        </div>
      )}

      <div className="text-center">
        <Link
          href={`/events/${id}`}
          className="text-blue-600 underline text-sm"
        >
          Back to event
        </Link>
      </div>
    </div>
  );
}
