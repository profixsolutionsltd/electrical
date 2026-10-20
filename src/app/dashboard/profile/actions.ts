"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/** Update the current user's profile details. */
export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Not authenticated" };

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();

  if (name.length < 2) return { ok: false, message: "Please enter your name." };

  await prisma.user.update({
    where: { id: session.sub },
    data: {
      name,
      phone: phone || null,
      avatarUrl: avatarUrl || null,
    },
  });

  revalidatePath("/dashboard/profile");
  return { ok: true, message: "Profile updated." };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Change the current user's password (requires the current password). */
export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Not authenticated" };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Please check your input." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return { ok: false, message: "Account not found." };

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { ok: false, message: "Your current password is incorrect." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: session.sub }, data: { passwordHash } });
  // Revoke other sessions for security after a password change.
  await prisma.session.deleteMany({ where: { userId: session.sub } });

  revalidatePath("/dashboard/security");
  return { ok: true, message: "Password changed. Please sign in again on other devices." };
}
