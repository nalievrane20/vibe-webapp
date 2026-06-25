import { getDashboardStats } from "@/app/actions/admin/dashboard";
import { Users, Calendar, ClipboardList, Newspaper } from "lucide-react";
import Image from "next/image";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-5 space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* Logo Section */}
      <div className="flex flex-col items-left text-left">
        <Image
          src="/vibe-logo.png"
          alt="VIBE Logo"
          width={100}
          height={100}
          className="rounded-lg"
        />

        <p className="text-muted-foreground pt-5">College Event Management System</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Users</p>

            <Users className="h-5 w-5 text-muted-foreground" />
          </div>

          <h2 className="mt-2 text-3xl font-bold">{stats.totalUsers}</h2>
        </div>

        <div className="rounded-lg border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Events</p>

            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>

          <h2 className="mt-2 text-3xl font-bold">{stats.totalEvents}</h2>
        </div>
        <div className="rounded-lg border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Registrations</p>

            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </div>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.totalRegistrations}
          </h2>
        </div>

        <div className="rounded-lg border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total News</p>

            <Newspaper className="h-5 w-5 text-muted-foreground" />
          </div>

          <h2 className="mt-2 text-3xl font-bold">{stats.totalNews}</h2>
        </div>
      </div>
    </div>
  );
}
