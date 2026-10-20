import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";

/**
 * Returns the currently authenticated user (if any) for use in server
 * components such as the navigation. Returns null for anonymous visitors.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatarUrl: true,
      status: true,
    },
  });
  if (!user || user.status === "SUSPENDED") return null;
  return { ...user, role: user.role as Role };
}
