"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  registerForEvent,
  getMyRegistration,
} from "@/app/actions/admin/registration";
import { AttendanceMode } from "@/generated/prisma/enums";

export default function EventRegistration({
  eventId,
  fee,
  isLoggedIn,
  existingStatus,
  registrationId,
}: {
  eventId: number;
  fee?: number;
  isLoggedIn: boolean;
  registrationId?: number | null;
  existingStatus?: "PENDING" | "PAID" | "FAILED" | null;
}) {
  const [mode, setMode] = useState<AttendanceMode>("ONSITE");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isFree = fee == null || fee <= 0;

  if (existingStatus === "PAID") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          You're registered for this event.
        </div>

        {existingStatus === "PAID" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/events/ticket/${eventId}`)} // ✅
          >
            🎟 View Ticket
          </Button>
        )}
      </div>
    );
  }

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await registerForEvent(eventId, mode);
      if (!res.success) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      if (res.free) {
        router.refresh();
        return;
      }
      if (res.checkoutUrl) window.location.href = res.checkoutUrl;
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900">Join this event</h3>
      <p className="mt-1 text-sm text-gray-500">
        {isFree ? "This event is free." : `Fee: ₱${fee?.toFixed(2)}`}
      </p>

      <div className="mt-3 flex gap-3">
        {(["ONSITE", "ONLINE"] as AttendanceMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${
              mode === m
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {m === "ONSITE" ? "Onsite" : "Online"}
          </button>
        ))}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <Button
        className="mt-4 w-full"
        onClick={handleSubmit}
        disabled={pending || !isLoggedIn}
      >
        {!isLoggedIn
          ? "Log in to join"
          : pending
            ? "Processing..."
            : isFree
              ? "Confirm Registration"
              : "Continue to Payment"}
      </Button>
    </div>
  );
}
