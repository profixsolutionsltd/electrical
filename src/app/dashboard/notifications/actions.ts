"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** Mark a single notification as read (scoped to the current user). */
export async function markNotificationRead(notificationId: string) {
  const session = await getSession();
  if (!session) return;
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.sub },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
}

/** Mark all of the current user's notifications as read. */
export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session) return;
  await prisma.notification.updateMany({
    where: { userId: session.sub, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
}
