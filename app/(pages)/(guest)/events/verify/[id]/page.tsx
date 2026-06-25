import prisma from "@/lib/prisma";

export default async function VerifyTicket({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const registration =
    await prisma.eventRegistration.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        event: true,
        user: true,
      },
    });

  if (!registration) {
    return (
      <div className="p-10 text-center text-red-600">
        ❌ Invalid Ticket
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 border rounded-xl p-6">
      <h1 className="text-2xl font-bold text-green-600">
        ✅ Valid Ticket
      </h1>

      <div className="mt-4 space-y-2">
        <p>
          <strong>Event:</strong> {registration.event.title}
        </p>

        <p>
          <strong>Student:</strong>{" "}
          {registration.user.first_name}{" "}
          {registration.user.last_name}
        </p>

        <p>
          <strong>Status:</strong> {registration.status}
        </p>

        <p>
          <strong>Mode:</strong> {registration.mode}
        </p>
      </div>
    </div>
  );
}