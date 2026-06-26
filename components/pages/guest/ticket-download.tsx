"use client";

import { Button } from "@/components/ui/button";

export default function TicketDownload({
  qrCode,
  ticketNumber,
  eventTitle,
  studentName,
  mode,
  status,
  eventDate,
}: {
  qrCode: string;
  ticketNumber: string;
  eventTitle: string;
  studentName: string;
  mode: string;
  status: string;
  eventDate: string;
}) {
  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 420;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 420);

    // Header strip
    ctx.fillStyle = "#1d4ed8";
    ctx.fillRect(0, 0, 600, 70);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("🎟 Event Ticket", 24, 45);

    // Ticket details
    ctx.fillStyle = "#111827";
    ctx.font = "bold 14px sans-serif";
    const details = [
      ["Event", eventTitle],
      ["Student", studentName],
      ["Mode", mode],
      ["Status", status],
      ["Ticket #", ticketNumber],
      ["Date", new Date(eventDate).toLocaleDateString()],
    ];

    details.forEach(([label, value], i) => {
      const y = 110 + i * 38;
      ctx.fillStyle = "#6b7280";
      ctx.font = "12px sans-serif";
      ctx.fillText(label.toUpperCase(), 24, y - 10);
      ctx.fillStyle = "#111827";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText(value, 24, y + 8);
    });

    // QR code
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 400, 90, 175, 175);

      // Border
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 598, 418);

      const link = document.createElement("a");
      link.download = `${ticketNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    qrImg.src = qrCode;
  };

  return (
    <Button onClick={handleDownload} className="w-full mt-2">
      Download Ticket
    </Button>
  );
}
