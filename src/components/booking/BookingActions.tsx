"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking, rescheduleBooking } from "@/server/booking-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Field";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";

/** Booking actions: reschedule and cancel, with confirmation dialogs. */
export function BookingActions({
  bookingId,
  canCancel,
  canReschedule,
}: {
  bookingId: string;
  canCancel: boolean;
  canReschedule: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<"idle" | "reschedule" | "cancel">("idle");
  const [date, setDate] = useState("");
  const [window, setWindow] = useState("MORNING");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!canCancel && !canReschedule) {
    return (
      <p className="text-sm text-[rgb(var(--ayan-muted))]">
        This booking can no longer be changed.
      </p>
    );
  }

  const handleReschedule = async () => {
    if (!date) return;
    setLoading(true);
    const result = await rescheduleBooking(bookingId, date, window as never);
    setLoading(false);
    if (result.ok) {
      toast.success("Appointment rescheduled", result.message);
      setMode("idle");
      router.refresh();
    } else {
      toast.error("Couldn't reschedule", result.message);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    const result = await cancelBooking(bookingId, reason || undefined);
    setLoading(false);
    if (result.ok) {
      toast.success("Booking cancelled", result.message);
      router.refresh();
    } else {
      toast.error("Couldn't cancel", result.message);
    }
  };

  if (mode === "cancel") {
    return (
      <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">Cancel this booking?</p>
        <p className="text-xs text-red-700 dark:text-red-300">
          This will cancel your appointment. Any refund due follows our cancellation policy.
        </p>
        <Input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="danger" size="sm" onClick={handleCancel} loading={loading}>
            Yes, cancel booking
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMode("idle")} disabled={loading}>
            Keep booking
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "reschedule") {
    return (
      <div className="space-y-3 rounded-xl border border-[rgb(var(--ayan-border))] p-4">
        <p className="text-sm font-semibold text-[rgb(var(--ayan-text))]">Reschedule appointment</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="date" label="New date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select label="Time window" value={window} onChange={(e) => setWindow(e.target.value)}>
            <option value="MORNING">Morning (8am–12pm)</option>
            <option value="AFTERNOON">Afternoon (12pm–5pm)</option>
            <option value="EVENING">Evening (5pm–8pm)</option>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleReschedule} loading={loading} disabled={!date}>
            Confirm new time
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMode("idle")} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canReschedule && (
        <Button variant="outline" size="sm" onClick={() => setMode("reschedule")}>
          <Icons.calendar className="h-4 w-4" />
          Reschedule
        </Button>
      )}
      {canCancel && (
        <Button variant="outline" size="sm" onClick={() => setMode("cancel")} className="text-red-600 hover:border-red-300">
          Cancel booking
        </Button>
      )}
    </div>
  );
}
