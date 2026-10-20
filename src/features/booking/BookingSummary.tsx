"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { formatMoney } from "@/lib/format";
import type { BookingQuote } from "./actions";
import { cn } from "@/lib/utils";

/**
 * The persistent "Booking Summary" panel. It mirrors the reference journey:
 * every selected service, the property, the appointment and the running total
 * stay visible while the customer moves through the steps.
 */
export function BookingSummary({
  quote,
  property,
  appointment,
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  discountError,
  discountMessage,
  paymentMethod = "PAY_LATER",
  className,
}: {
  quote: BookingQuote | null;
  property?: { addressLine1: string; city: string; postcode: string };
  appointment?: { date: string; window: string };
  discountCode: string;
  onDiscountCodeChange: (value: string) => void;
  onApplyDiscount: () => void;
  discountError?: string | null;
  discountMessage?: string | null;
  paymentMethod?: "PAY_LATER" | "CARD";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside className={cn("lg:sticky lg:top-24", className)}>
      {/* Mobile summary bar */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-4 text-left shadow-soft lg:hidden"
        aria-expanded={open}
      >
        <span>
          <span className="block text-xs font-medium uppercase tracking-wide text-[rgb(var(--ayan-muted))]">
            Booking summary
          </span>
          <span className="mt-0.5 block font-display text-lg font-bold text-[rgb(var(--ayan-text))]">
            {quote ? formatMoney(quote.total, quote.currency) : "—"}
          </span>
        </span>
        <Icons.chevronDown
          className={cn(
            "h-5 w-5 text-[rgb(var(--ayan-muted))] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "mt-3 overflow-hidden rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] shadow-soft",
          !open && "hidden lg:block",
        )}
      >
        <div className="border-b border-[rgb(var(--ayan-border))] p-5">
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
            Booking Summary
          </h2>
        </div>

        {/* Services */}
        <div className="border-b border-[rgb(var(--ayan-border))] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--ayan-muted))]">
            All services in this booking
          </p>
          {quote && quote.items.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {quote.items.map((item) => (
                <li key={item.serviceId} className="text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-[rgb(var(--ayan-text))]">
                      {item.serviceName}
                    </span>
                    <span className="shrink-0 font-semibold text-[rgb(var(--ayan-text))]">
                      {formatMoney(item.lineTotal, quote.currency)}
                    </span>
                  </div>
                  {item.adjustments.map((adjustment) => (
                    <p
                      key={adjustment.label}
                      className="mt-0.5 flex items-center justify-between gap-3 text-xs text-[rgb(var(--ayan-muted))]"
                    >
                      <span>{adjustment.label}</span>
                      <span>
                        {adjustment.amount > 0 ? "+" : "−"}
                        {formatMoney(Math.abs(adjustment.amount), quote.currency)}
                      </span>
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
              No services selected yet.
            </p>
          )}
        </div>

        {/* Property & appointment */}
        {(property?.addressLine1 || appointment?.date) && (
          <div className="space-y-3 border-b border-[rgb(var(--ayan-border))] p-5 text-sm">
            {property?.addressLine1 && (
              <p className="flex items-start gap-2 text-[rgb(var(--ayan-muted))]">
                <Icons.mapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {property.addressLine1}
                  {property.city ? `, ${property.city}` : ""}{" "}
                  {property.postcode}
                </span>
              </p>
            )}
            {appointment?.date && (
              <p className="flex items-start gap-2 text-[rgb(var(--ayan-muted))]">
                <Icons.calendar className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {appointment.date} · {appointment.window}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Discount */}
        <div className="border-b border-[rgb(var(--ayan-border))] p-5">
          <label
            htmlFor="discount-code"
            className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--ayan-muted))]"
          >
            Discount code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="discount-code"
              value={discountCode}
              onChange={(e) => onDiscountCodeChange(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="h-10 min-w-0 flex-1 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] px-3 text-sm uppercase transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <button
              type="button"
              onClick={onApplyDiscount}
              className="h-10 shrink-0 rounded-xl border border-[rgb(var(--ayan-border))] px-3 text-sm font-semibold text-[rgb(var(--ayan-text))] transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              Apply
            </button>
          </div>
          {discountError && (
            <p className="mt-2 text-xs font-medium text-red-600">{discountError}</p>
          )}
          {discountMessage && (
            <p className="mt-2 text-xs font-medium text-emerald-600">
              {discountMessage}
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-2 p-5 text-sm">
          <Row label="Subtotal" value={quote ? formatMoney(quote.subtotal, quote.currency) : "—"} />
          <Row
            label={`VAT (${quote?.vatRate ?? 20}%)`}
            value={quote ? formatMoney(quote.vatAmount, quote.currency) : "—"}
          />
          {quote && quote.discount > 0 && (
            <Row
              label={`Discount${quote.discountCode ? ` (${quote.discountCode})` : ""}`}
              value={`−${formatMoney(quote.discount, quote.currency)}`}
              accent
            />
          )}
          <div className="flex items-center justify-between border-t border-[rgb(var(--ayan-border))] pt-3">
            <span className="font-display text-base font-semibold text-[rgb(var(--ayan-text))]">
              Total
            </span>
            <span className="font-display text-xl font-bold text-[rgb(var(--ayan-text))]">
              {quote ? formatMoney(quote.total, quote.currency) : "—"}
            </span>
          </div>
          <p className="text-xs text-[rgb(var(--ayan-muted))]">
            {paymentMethod === "CARD"
              ? "Payment is taken securely when you confirm the booking."
              : "Pay nothing today — settle the invoice once the job is done."}
          </p>
        </div>
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[rgb(var(--ayan-muted))]">{label}</span>
      <span
        className={cn(
          "font-medium",
          accent ? "text-emerald-600" : "text-[rgb(var(--ayan-text))]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
