"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import {
  assignBookingEngineer,
  updateBookingStatusAdmin,
  rescheduleBookingAdmin,
  recordManualPayment,
} from "../../actions";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/constants";

export interface BookingDetailClientProps {
  bookingId: string;
  reference: string;
  status: string;
  currentEngineerId: string | null;
  availableEngineers: { id: string; user: { name: string; email: string; phone: string | null } }[];
  totalPence: number;
}

export function BookingDetailClient({
  bookingId,
  reference,
  status,
  currentEngineerId,
  availableEngineers,
  totalPence,
}: BookingDetailClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // States for sub-panels
  const [selectedEngineer, setSelectedEngineer] = useState(currentEngineerId ?? "");
  const [newStatus, setNewStatus] = useState(status);
  const [statusNote, setStatusNote] = useState("");
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleWindow, setRescheduleWindow] = useState("MORNING");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleAssign = async () => {
    setLoading(true);
    const engId = selectedEngineer || null;
    const result = await assignBookingEngineer(bookingId, engId);
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === status) return;
    setLoading(true);
    const result = await updateBookingStatusAdmin(
      bookingId,
      newStatus as BookingStatus,
      statusNote || undefined
    );
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      setStatusNote("");
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleDate) return;
    setLoading(true);
    const result = await rescheduleBookingAdmin(bookingId, rescheduleDate, rescheduleWindow);
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      setShowReschedule(false);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleManualPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("bookingId", bookingId);
    const result = await recordManualPayment(formData);
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      setShowPaymentModal(false);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Engineer Assignment Card */}
      <Card className="p-6">
        <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))] mb-1">
          Engineer Dispatch & Assignment
        </h3>
        <p className="text-xs text-[rgb(var(--ayan-muted))] mb-4">
          Assign an approved, certified engineer to fulfill this booking.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <select
            value={selectedEngineer}
            onChange={(e) => setSelectedEngineer(e.target.value)}
            className="flex-1 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
          >
            <option value="">-- No Engineer Assigned --</option>
            {availableEngineers.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.user.name} ({eng.user.phone || eng.user.email})
              </option>
            ))}
          </select>
          <Button onClick={handleAssign} loading={loading} size="sm">
            Save Assignment
          </Button>
        </div>
      </Card>

      {/* Status Management Card */}
      <Card className="p-6">
        <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))] mb-1">
          Booking Status Controls
        </h3>
        <p className="text-xs text-[rgb(var(--ayan-muted))] mb-4">
          Override or transition the booking lifecycle state.
        </p>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
              >
                <option value={BOOKING_STATUS.PENDING}>Pending</option>
                <option value={BOOKING_STATUS.CONFIRMED}>Confirmed</option>
                <option value={BOOKING_STATUS.ASSIGNED}>Assigned</option>
                <option value={BOOKING_STATUS.IN_PROGRESS}>In Progress</option>
                <option value={BOOKING_STATUS.COMPLETED}>Completed</option>
                <option value={BOOKING_STATUS.CANCELLED}>Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1">
                Audit / Customer Reason
              </label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Optional explanation for audit log"
                className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReschedule(true)}
              >
                <Icons.calendar className="h-4 w-4" />
                Reschedule Date
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPaymentModal(true)}
              >
                <Icons.creditCard className="h-4 w-4" />
                Record Payment
              </Button>
            </div>

            <Button
              onClick={handleStatusUpdate}
              loading={loading}
              disabled={newStatus === status && !statusNote}
              size="sm"
            >
              Update Status
            </Button>
          </div>
        </div>
      </Card>

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md p-6 bg-[rgb(var(--ayan-card))] shadow-xl">
            <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] pb-4 mb-4">
              <h3 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                Reschedule Booking {reference}
              </h3>
              <button
                type="button"
                onClick={() => setShowReschedule(false)}
                className="text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
              >
                <Icons.close className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1">
                  New Appointment Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1">
                  Time Window
                </label>
                <select
                  value={rescheduleWindow}
                  onChange={(e) => setRescheduleWindow(e.target.value)}
                  className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
                >
                  <option value="MORNING">Morning (08:00 - 12:00)</option>
                  <option value="AFTERNOON">Afternoon (12:00 - 16:00)</option>
                  <option value="EVENING">Evening (16:00 - 19:00)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[rgb(var(--ayan-border))]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReschedule(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Confirm Reschedule
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Manual Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md p-6 bg-[rgb(var(--ayan-card))] shadow-xl">
            <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] pb-4 mb-4">
              <h3 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                Record Payment for {reference}
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
              >
                <Icons.close className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleManualPayment} className="space-y-4">
              <Input
                name="amount"
                type="number"
                step="0.01"
                label="Amount Paid (£)"
                defaultValue={(totalPence / 100).toFixed(2)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1">
                  Payment Method
                </label>
                <select
                  name="method"
                  defaultValue="BANK_TRANSFER"
                  className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer / BACS</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash on Completion</option>
                  <option value="INVOICE">Invoice 30-Day Terms</option>
                </select>
              </div>

              <Input
                name="providerRef"
                label="Transaction / Reference Code"
                placeholder="e.g. BACS-892182 or terminal receipt"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-[rgb(var(--ayan-border))]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Save Payment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

