"use client";

import { useRouter } from "next/navigation";
import { markAllNotificationsRead, markNotificationRead } from "./actions";
import { Button } from "@/components/ui/Button";
import { Icons, getIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

const TONE_ICON: Record<string, string> = {
  SUCCESS: "checkCircle",
  WARNING: "alert",
  BOOKING: "calendar",
  PAYMENT: "creditCard",
  INFO: "info",
};

const TONE_CLASS: Record<string, string> = {
  SUCCESS: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50",
  WARNING: "bg-amber-100 text-amber-600 dark:bg-amber-950/50",
  BOOKING: "bg-[rgb(var(--ayan-brand-soft))] text-brand-600",
  PAYMENT: "bg-sky-100 text-sky-600 dark:bg-sky-950/50",
  INFO: "bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]",
};

/** Notifications list with mark-as-read. */
export function NotificationsClient({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[rgb(var(--ayan-text))]">Notifications</h1>
          <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
            {unread > 0 ? `${unread} unread` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <Button variant="outline" size="sm" type="submit">Mark all read</Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
            <Icons.bell className="h-7 w-7" />
          </div>
          <h2 className="ayan-h3 mt-4 text-[rgb(var(--ayan-text))]">No notifications</h2>
          <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">We'll let you know when something happens.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => {
            const iconName = TONE_ICON[n.type] ?? "info";
            const Icon = getIcon(iconName);
            return (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border p-4 transition-colors",
                  n.readAt
                    ? "border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))]"
                    : "border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/20",
                )}
              >
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", TONE_CLASS[n.type] ?? TONE_CLASS.INFO)}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[rgb(var(--ayan-text))]">{n.title}</p>
                    {!n.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">{n.body}</p>
                  <p className="mt-1 text-xs text-[rgb(var(--ayan-muted))]">{formatDateTime(n.createdAt)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    {n.link && (
                      <button onClick={() => router.push(n.link!)} className="text-xs font-medium text-brand-600 hover:underline">
                        View details
                      </button>
                    )}
                    {!n.readAt && (
                      <form action={markNotificationRead.bind(null, n.id)}>
                        <button type="submit" className="text-xs font-medium text-[rgb(var(--ayan-muted))] hover:underline">
                          Mark as read
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
