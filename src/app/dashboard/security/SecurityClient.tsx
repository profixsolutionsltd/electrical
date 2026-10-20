"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "../profile/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/Input";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { formatDateTime } from "@/lib/format";

export interface SessionItem {
  id: string;
  createdAt: string;
  expiresAt: string;
  rememberMe: boolean;
  current: boolean;
}

/** Security settings: change password + view active sessions. */
export function SecurityClient({ sessions }: { sessions: SessionItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await changePassword(new FormData(e.currentTarget));
    setLoading(false);
    if (result.ok) {
      toast.success("Password changed", result.message);
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error("Couldn't change password", result.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
            <Icons.shield className="h-5 w-5" />
          </span>
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Change password</h2>
        </div>
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <PasswordInput name="currentPassword" label="Current password" autoComplete="current-password" required />
          <PasswordInput name="newPassword" label="New password" autoComplete="new-password" required hint="At least 8 characters with upper, lower and a number." />
          <PasswordInput name="confirmPassword" label="Confirm new password" autoComplete="new-password" required />
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>Update password</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
            <Icons.users className="h-5 w-5" />
          </span>
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Active sessions</h2>
        </div>
        {sessions.length === 0 ? (
          <p className="mt-4 text-sm text-[rgb(var(--ayan-muted))]">No active sessions found.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl border border-[rgb(var(--ayan-border))] p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
                    <Icons.shieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--ayan-text))]">
                      {s.current ? "This device" : "Other device"}
                      {s.rememberMe && <span className="ml-2 text-xs text-[rgb(var(--ayan-muted))]">(remembered)</span>}
                    </p>
                    <p className="text-xs text-[rgb(var(--ayan-muted))]">
                      Signed in {formatDateTime(s.createdAt)} · expires {formatDateTime(s.expiresAt)}
                    </p>
                  </div>
                </div>
                {s.current && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    Current
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-[rgb(var(--ayan-muted))]">
          Changing your password signs you out of other devices for your security.
        </p>
      </Card>
    </div>
  );
}
