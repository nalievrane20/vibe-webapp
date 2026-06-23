import { getAnalyticsOverview } from "@/app/actions/admin/analytics";
import AnalyticsCharts from "@/components/pages/admin/analytics/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CalendarDays,
  Newspaper,
  Wallet,
  Heart,
  Ticket,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalyticsOverview();

  const statCards = [
    { label: "Total Users", value: data.stats.totalUsers, icon: Users },
    {
      label: "Total Events",
      value: data.stats.totalEvents,
      icon: CalendarDays,
    },
    { label: "Total News", value: data.stats.totalNews, icon: Newspaper },
    {
      label: "Registrations",
      value: data.stats.totalRegistrations,
      icon: Ticket,
    },
    {
      label: "Revenue (Paid)",
      value: `₱${data.stats.totalRevenue.toLocaleString()}`,
      icon: Wallet,
    },
    {
      label: "Likes + Comments",
      value: data.stats.totalEngagement,
      icon: Heart,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnalyticsCharts data={data} />
    </div>
  );
}
