import prisma from "@/lib/prisma";

async function main() {
  const courses = await prisma.course.findMany();
  console.log(JSON.stringify(courses, null, 2));
}

main().finally(() => prisma.$disconnect());