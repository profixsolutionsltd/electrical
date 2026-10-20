"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/guards";
import { addToPremiumWaitlist, getPremiumState } from "@/server/premium";
import { logAudit } from "@/server/audit";

/**
 * Premium tier actions. The tier is not purchasable yet — the only thing a
 * customer can do is join the launch waitlist.
 */

export interface PremiumWaitlistState {
  ok: boolean;
  message?: string;
}

export async function joinPremiumWaitlistAction(
  _prev: PremiumWaitlistState,
  formData: FormData,
): Promise<PremiumWaitlistState> {
  const session = await requireUser("/dashboard/premium");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || session.name;

  if (!email || !email.includes("@") || email.includes(" ")) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const state = await getPremiumState();
  if (!state.waitlistOpen) {
    return {
      ok: false,
      message: "The Premium waitlist is closed right now. Please check back soon.",
    };
  }

  await addToPremiumWaitlist({
    email,
    name,
    userId: session.sub,
    source: "dashboard",
  });

  await logAudit({
    actorId: session.sub,
    action: "PREMIUM_WAITLIST_JOIN",
    entity: "PremiumWaitlist",
    metadata: { email },
  });

  revalidatePath("/dashboard/premium");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "You're on the list — we'll email you the moment Premium goes live.",
  };
}
