import prisma from "@/lib/prisma";

async function main() {
  const channels = await prisma.chatChannel.findMany({
    include: { course: { select: { title: true } } },
  });
  console.log(JSON.stringify(channels, null, 2));
}

main().finally(() => prisma.$disconnect());
