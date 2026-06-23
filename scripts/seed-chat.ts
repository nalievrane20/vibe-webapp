import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  const existingGeneral = await prisma.chatChannel.findFirst({
    where: { type: "GENERAL" },
  });
  if (!existingGeneral) {
    await prisma.chatChannel.create({ data: { type: "GENERAL" } });
    console.log("Created GENERAL channel");
  }

  const courses = await prisma.course.findMany({
    include: { chatChannel: true },
  });

  for (const course of courses) {
    if (!course.chatChannel) {
      await prisma.chatChannel.create({
        data: { type: "COURSE", course_id: course.id },
      });
      console.log(`Created COURSE channel for "${course.title}"`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
