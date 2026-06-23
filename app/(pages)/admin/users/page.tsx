import { getUsers } from "@/app/actions/admin/user";
import { getCourses } from "@/app/actions/admin/course";
import { UserTable } from "@/components/pages/admin/users/user-table";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [users, courses] = await Promise.all([getUsers(), getCourses()]);

  return (
    <div>
      <UserTable data={users} courses={courses} />
    </div>
  );
}