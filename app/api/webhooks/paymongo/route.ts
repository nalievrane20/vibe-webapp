export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(rawBody: string, signatureHeader: string, secret: string) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("="))
  ) as Record<string, string>;

  const signedPayload = `${parts.t}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  return parts.te === expected || parts.li === expected;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paymongo-signature");
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!signature || !secret || !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const type = event.data?.attributes?.type;
  const checkoutId = event.data?.attributes?.data?.id;

  // 👇 MOVE PRISMA IMPORT INSIDE HANDLER
  const { default: prisma } = await import("@/lib/prisma");

  if (checkoutId && type === "checkout_session.payment.paid") {
    await prisma.eventRegistration.updateMany({
      where: { paymongo_checkout_id: checkoutId },
      data: { status: "PAID" },
    });
  }

  if (checkoutId && type === "checkout_session.payment.failed") {
    await prisma.eventRegistration.updateMany({
      where: { paymongo_checkout_id: checkoutId },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ received: true });
}