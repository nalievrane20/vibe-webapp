import Topbar from "@/components/pages/guest/topbar";
import { getCurrentUser } from "@/lib/auth";
import { toVibeUser } from "@/lib/vibe-user";
import { getNotifications } from "@/app/actions/admin/notifications";
import React from "react";

export default async function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [dbUser, notifications] = await Promise.all([
    getCurrentUser(),
    getNotifications(),
  ]);

  const user = dbUser ? toVibeUser(dbUser) : undefined;

  return (
    <main>
      <Topbar user={user} notifications={notifications} />
      {children}
    </main>
  );
}