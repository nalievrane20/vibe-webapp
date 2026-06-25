import prisma from "@/lib/prisma";
import Link from "next/link";

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
    ? await prisma.eventRegistration.findUnique({ where: { id: Number(reg) } })
    : null;

  const isPaid = registration?.status === "PAID";

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">
        {isPaid ? "You're all set!" : "Almost there..."}
      </h1>
      <p className="mt-2 text-gray-600">
        {isPaid
          ? "Your registration is confirmed. We'll see you at the event."
          : "We're confirming your payment — this usually takes a few seconds. Refresh if it doesn't update."}
      </p>
      <Link href={`/events/${id}`} className="mt-6 inline-block text-blue-600 underline">
        Back to event
      </Link>
    </div>
  );
}