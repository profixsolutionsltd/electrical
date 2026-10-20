"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket, replyToTicket } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Field";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { TicketCard } from "./TicketCard";

export interface TicketItem {
  id: string;
  reference: string;
  subject: string;
  status: string;
  createdAt: string;
  booking: { reference: string } | null;
  messages: { id: string; body: string; authorRole: string; createdAt: string }[];
}

/** Support centre: create ticket + view threads. */
export function SupportClient({ tickets }: { tickets: TicketItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await createTicket(new FormData(e.currentTarget));
    setLoading(false);
    if (result.ok) {
      toast.success("Ticket created");
      router.refresh();
      setCreating(false);
    } else {
      toast.error("Couldn't create", result.message);
    }
  };

  const onReply = async (ticketId: string, body: string) => {
    const result = await replyToTicket(ticketId, body);
    if (result.ok) {
      toast.success("Reply sent");
      router.refresh();
    } else {
      toast.error("Couldn't send", result.message);
    }
    return result.ok;
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[rgb(var(--ayan-text))]">Support</h1>
          <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">Raise a request and track our replies.</p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Icons.plus className="h-4 w-4" />
          New ticket
        </Button>
      </div>

      {creating && (
        <form onSubmit={onCreate} className="mb-6 space-y-4 rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6">
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">New support ticket</h2>
          <Input name="subject" label="Subject" placeholder="How can we help?" required />
          <Textarea name="message" label="Message" rows={4} placeholder="Describe your issue…" required />
          <div className="flex gap-2">
            <Button type="submit" loading={loading}>Submit ticket</Button>
            <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
            <Icons.message className="h-7 w-7" />
          </div>
          <h2 className="ayan-h3 mt-4 text-[rgb(var(--ayan-text))]">No support tickets</h2>
          <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">Raise a ticket and our team will help you out.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onReply={onReply} />
          ))}
        </div>
      )}
    </>
  );
}
