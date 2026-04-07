import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.webUser.findUnique({
    where: { id: Number(session.user?.id) },
    select: { telegramChatId: true },
  });

  return (
    <DashboardClient
      email={session.user?.email ?? ""}
      telegramLinked={!!user?.telegramChatId}
    />
  );
}
