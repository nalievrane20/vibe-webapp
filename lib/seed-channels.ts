import prisma from "@/lib/prisma";

async function main() {
  await prisma.chatChannel.create({
    data: { type: "GENERAL" },
  });

  const courses = await prisma.course.findMany();

  for (const course of courses) {
    await prisma.chatChannel.create({
      data: {
        type: "COURSE",
        course_id: course.id,
      },
    });
  }

  console.log("Channels seeded.");
}

main().finally(() => prisma.$disconnect());
