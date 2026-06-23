import prisma from "@/lib/prisma";
import { hashPassword } from "../lib/auth";

async function main() {
  const studentPassword = await hashPassword("password123");
  const adminPassword = await hashPassword("admin123");

  const student = await prisma.user.upsert({
    where: { email: "juan.delacruz@example.edu" },
    update: {},
    create: {
      student_id: "2021-00123",
      first_name: "Juan",
      middle_name: "Santos",
      last_name: "Dela Cruz",
      email: "juan.delacruz@example.edu",
      course_id: null,
      password: studentPassword,
      role: "STUDENT", // ⚠️ adjust if `role` is an enum in your schema, e.g. Role.STUDENT
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.edu" },
    update: {},
    create: {
      student_id: "ADMIN-0001",
      first_name: "Admin",
      middle_name: null,
      last_name: "User",
      email: "admin@example.edu",
      course_id: null,
      password: adminPassword,
      role: "ADMIN", // ⚠️ adjust if `role` is an enum, e.g. Role.ADMIN
    },
  });

  console.log("Seeded users:");
  console.log({ student: { email: student.email, role: student.role } });
  console.log({ admin: { email: admin.email, role: admin.role } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
