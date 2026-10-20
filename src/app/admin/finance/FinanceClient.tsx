"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { PaymentStatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";
import { refundPayment } from "../actions";
import { formatMoney, formatDateTime } from "@/lib/format";

export interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  providerRef: string | null;
  refundedAmount: number;
  paidAt: string | Date | null;
  createdAt: string | Date;
  booking: {
    id: string;
    reference: string;
    contactName: string;
    contactEmail: string;
  };
}

export interface InvoiceItem {
  id: string;
  number: string;
  bookingId: string;
  issuedAt: string | Date;
  dueAt: string | Date | null;
  subtotal: number;
  vatAmount: number;
  total: number;
  status: string;
  booking: {
    id: string;
    reference: string;
    contactName: string;
  };
}

export function FinanceClient({
  payments,
  invoices,
}: {
  payments: PaymentItem[];
  invoices: InvoiceItem[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"payments" | "invoices">("payments");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.booking.reference.toLowerCase().includes(search.toLowerCase()) ||
      p.booking.contactName.toLowerCase().includes(search.toLowerCase()) ||
      p.booking.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
      (p.providerRef && p.providerRef.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefund = async (payment: PaymentItem) => {
    const refundable = payment.amount - payment.refundedAmount;
    const amountStr = prompt(
      `Enter refund amount in £ (Maximum: £${(refundable / 100).toFixed(2)}):`,
      (refundable / 100).toFixed(2)
    );
    if (!amountStr) return;

    const amountPence = Math.round(Number(amountStr) * 100);
    if (isNaN(amountPence) || amountPence <= 0 || amountPence > refundable) {
      alert("Invalid refund amount entered.");
      return;
    }

    setLoadingId(payment.id);
    const result = await refundPayment(payment.id, amountPence);
    setLoadingId(null);

    if (result.ok) {
      toast.success("Refund processed", result.message);
      router.refresh();
    } else {
      toast.error("Refund failed", result.message);
    }
  };

  const exportCSV = () => {
    let headers: string[];
    let rows: string[][];

    if (activeTab === "payments") {
      headers = ["Payment ID", "Booking Ref", "Customer", "Amount (£)", "Refunded (£)", "Method", "Status", "Date"];
      rows = filteredPayments.map((p) => [
        p.id,
        p.booking.reference,
        `"${p.booking.contactName}"`,
        (p.amount / 100).toFixed(2),
        (p.refundedAmount / 100).toFixed(2),
        p.method,
        p.status,
        new Date(p.createdAt).toISOString(),
      ]);
    } else {
      headers = ["Invoice No", "Booking Ref", "Customer", "Subtotal (£)", "VAT (£)", "Total (£)", "Status", "Issued Date"];
      rows = invoices.map((inv) => [
        inv.number,
        inv.booking.reference,
        `"${inv.booking.contactName}"`,
        (inv.subtotal / 100).toFixed(2),
        (inv.vatAmount / 100).toFixed(2),
        (inv.total / 100).toFixed(2),
        inv.status,
        new Date(inv.issuedAt).toISOString(),
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ayan_${activeTab}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-1">
          <button
            onClick={() => setActiveTab("payments")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "payments"
                ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
                : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
            }`}
          >
            Payments ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "invoices"
                ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
                : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
            }`}
          >
            Invoices ({invoices.length})
          </button>
        </div>

        <Button onClick={exportCSV} variant="outline">
          <Icons.download className="h-4 w-4" />
          Export CSV Report
        </Button>
      </div>

      {activeTab === "payments" ? (
        <Card className="overflow-hidden">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 border-b border-[rgb(var(--ayan-border))] p-5 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ref, customer, provider ref…"
              className="w-full sm:max-w-sm rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-4 py-2 text-sm text-[rgb(var(--ayan-text))] placeholder-[rgb(var(--ayan-muted))] focus:border-brand-500 focus:outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-10 text-center text-sm text-[rgb(var(--ayan-muted))]">
              No payment transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
                  <tr>
                    <th className="px-5 py-3">Booking Ref</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Method / Ref</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-[rgb(var(--ayan-surface))]/50 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-[rgb(var(--ayan-text))]">
                        <Link
                          href={`/admin/bookings/${p.booking.id}`}
                          className="text-brand-600 hover:underline"
                        >
                          {p.booking.reference}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-[rgb(var(--ayan-text))]">{p.booking.contactName}</p>
                        <p className="text-xs text-[rgb(var(--ayan-muted))]">{p.booking.contactEmail}</p>
                      </td>
                      <td className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">
                        {formatMoney(p.amount)}
                        {p.refundedAmount > 0 && (
                          <p className="text-xs text-red-600 font-normal">
                            Refunded: {formatMoney(p.refundedAmount)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        <p className="font-medium text-[rgb(var(--ayan-text))]">{p.method}</p>
                        {p.providerRef && <p className="font-mono">{p.providerRef}</p>}
                      </td>
                      <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        {formatDateTime(p.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <PaymentStatusBadge status={p.status as never} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {p.status === "PAID" && p.refundedAmount < p.amount && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRefund(p)}
                            loading={loadingId === p.id}
                            className="text-xs text-amber-600 hover:bg-amber-50"
                          >
                            Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-10 text-center text-sm text-[rgb(var(--ayan-muted))]">
              No invoices generated yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
                  <tr>
                    <th className="px-5 py-3">Invoice No</th>
                    <th className="px-5 py-3">Booking Ref</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Issued Date</th>
                    <th className="px-5 py-3">Subtotal</th>
                    <th className="px-5 py-3">VAT</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[rgb(var(--ayan-surface))]/50 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-[rgb(var(--ayan-text))]">
                        {inv.number}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-brand-600">
                        <Link href={`/admin/bookings/${inv.bookingId}`} className="hover:underline">
                          {inv.booking.reference}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-[rgb(var(--ayan-text))]">
                        {inv.booking.contactName}
                      </td>
                      <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        {formatDateTime(inv.issuedAt)}
                      </td>
                      <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        {formatMoney(inv.subtotal)}
                      </td>
                      <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        {formatMoney(inv.vatAmount)}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">
                        {formatMoney(inv.total)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <a
                          href={`/api/invoices/${inv.bookingId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-brand-600 hover:underline text-xs"
                        >
                          Download PDF →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
