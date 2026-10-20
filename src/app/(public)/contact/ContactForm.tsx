"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Field";
import { Icons } from "@/components/ui/Icons";
import { submitContact, type ContactState } from "./actions";

const initial: ContactState = { ok: false };

/** Contact form using a server action with progressive enhancement. */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          }`}
          role="status"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="name" label="Full name" placeholder="Jane Doe" error={state.errors?.name} required />
        <Input name="email" type="email" label="Email" placeholder="jane@example.com" error={state.errors?.email} required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="phone" label="Phone (optional)" placeholder="+44 7700 900000" error={state.errors?.phone} />
        <Input name="subject" label="Subject" placeholder="How can we help?" error={state.errors?.subject} required />
      </div>
      <Textarea
        name="message"
        label="Message"
        rows={5}
        placeholder="Tell us a bit more about your enquiry…"
        error={state.errors?.message}
        required
      />
      <Button type="submit" size="lg" loading={pending} fullWidth>
        {pending ? "Sending…" : "Send message"}
        {!pending && <Icons.arrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}
