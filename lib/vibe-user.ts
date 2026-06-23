// lib/to-vibe-user.ts
import type { getCurrentUser } from "@/lib/auth";
import type { VibeUser } from "@/components/pages/guest/topbar";

type DbUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export function toVibeUser(user: DbUser): VibeUser {
  const fullName = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(" ");

  return {
    name: fullName,
    email: user.email,
    course: user.course?.title,
  };
}