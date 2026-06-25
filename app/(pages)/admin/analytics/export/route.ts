import * as XLSX from "xlsx";
import { getAnalyticsOverview, getAnalyticsExportData } from "@/app/actions/admin/analytics";
import { NextResponse } from 'next/server'

export async function GET() {
  const [overview, detail] = await Promise.all([
    getAnalyticsOverview(),
    getAnalyticsExportData(),
  ]);

  const wb = XLSX.utils.book_new();

  // Summary
  const summaryRows = [
    { Metric: "Total Users", Value: overview.stats.totalUsers },
    { Metric: "Total Events", Value: overview.stats.totalEvents },
    { Metric: "Total News", Value: overview.stats.totalNews },
    { Metric: "Total Registrations", Value: overview.stats.totalRegistrations },
    { Metric: "Total Revenue (Paid)", Value: overview.stats.totalRevenue },
    { Metric: "Total Likes + Comments", Value: overview.stats.totalEngagement },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "Summary");

  // Signups by month
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      overview.signupTrend.map((r) => ({ Month: r.label, "New Users": r.value }))
    ),
    "Signups by Month"
  );

  // Users by course
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      overview.usersPerCourse.map((r) => ({ Course: r.name, Users: r.users }))
    ),
    "Users by Course"
  );

  // Event engagement (full list, not capped)
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      detail.events.map((e) => ({
        Event: e.title,
        Date: e.event_date.toISOString().split("T")[0],
        Fee: e.fee ?? 0,
        Likes: e._count.likes,
        Comments: e._count.comments,
        Registrations: e._count.registrations,
      }))
    ),
    "Event Engagement"
  );

  // Revenue by month
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      overview.revenueTrend.map((r) => ({ Month: r.label, "Revenue (Paid)": r.value }))
    ),
    "Revenue by Month"
  );

  // Registration status
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      overview.registrationStatusCounts.map((r) => ({ Status: r.name, Count: r.value }))
    ),
    "Registration Status"
  );

  // News by month
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      overview.newsTrend.map((r) => ({ Month: r.label, "News Posted": r.value }))
    ),
    "News by Month"
  );

  // Registrations detail
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      detail.registrations.map((r) => ({
        Event: r.event.title,
        Student: `${r.user.first_name} ${r.user.last_name}`,
        Email: r.user.email,
        Amount: r.amount,
        Status: r.status,
        Mode: r.mode,
        Date: r.createdAt.toISOString().split("T")[0],
      }))
    ),
    "Registrations (Detail)"
  );

  // Users detail
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      detail.users.map((u) => ({
        "Student ID": u.student_id,
        Name: `${u.first_name} ${u.last_name}`,
        Email: u.email,
        Course: u.course?.title ?? "No course",
        Role: u.role,
        "Joined": u.createdAt.toISOString().split("T")[0],
      }))
    ),
    "Users (Detail)"
  );

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = `analytics-report-${new Date().toISOString().split("T")[0]}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}



