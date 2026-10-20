"use client";

import { useState } from "react";
import { TicketStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/format";
import type { TicketItem } from "./SupportClient";

/** Individual support ticket with its message thread and reply box. */
export function TicketCard({
  ticket,
  onReply,
}: {
  ticket: TicketItem;
  onReply: (ticketId: string, body: string) => Promise<boolean>;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    const ok = await onReply(ticket.id, reply);
    setSending(false);
    if (ok) setReply("");
  };

  return (
    <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[rgb(var(--ayan-text))]">{ticket.reference}</span>
            <TicketStatusBadge status={ticket.status as never} />
          </div>
          <h3 className="mt-1 font-semibold text-[rgb(var(--ayan-text))]">{ticket.subject}</h3>
          <p className="text-xs text-[rgb(var(--ayan-muted))]">
            Opened {formatDateTime(ticket.createdAt)}
            {ticket.booking ? ` · ${ticket.booking.reference}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-[rgb(var(--ayan-border))] pt-4">
        {ticket.messages.map((m) => (
          <div key={m.id} className="rounded-lg bg-[rgb(var(--ayan-surface))] p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--ayan-muted))]">
              {m.authorRole === "CUSTOMER" ? "You" : "Support"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[rgb(var(--ayan-text))]">{m.body}</p>
            <p className="mt-1 text-xs text-[rgb(var(--ayan-muted))]">{formatDateTime(m.createdAt)}</p>
          </div>
        ))}
      </div>

      {ticket.status !== "CLOSED" && (
        <div className="mt-4 flex gap-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply…"
            rows={2}
          />
          <Button onClick={handleReply} size="sm" className="self-end" loading={sending} disabled={!reply.trim()}>
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
