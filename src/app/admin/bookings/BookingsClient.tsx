"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { formatMoney, formatDateTime } from "@/lib/format";

export interface BookingRow {
  id: string;
  reference: string;
  customer: { id: string; name: string; email: string };
  assignedEngineer: { user: { name: string; phone: string | null } } | null;
  items: { serviceName: string }[];
  status: string;
  paymentStatus: string;
  scheduledAt: string | Date;
  timeWindow: string;
  postcode: string;
  total: number;
}

export function BookingsClient({ initialBookings }: { initialBookings: BookingRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = initialBookings.filter((b) => {
    const matchesSearch =
      b.reference.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.email.toLowerCase().includes(search.toLowerCase()) ||
      b.postcode.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="overflow-hidden">
      {/* Search & Filters */}
      <div className="flex flex-col gap-4 border-b border-[rgb(var(--ayan-border))] p-5 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ref, customer, postcode…"
          className="w-full sm:max-w-sm rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-4 py-2 text-sm text-[rgb(var(--ayan-text))] placeholder-[rgb(var(--ayan-muted))] focus:border-brand-500 focus:outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-[rgb(var(--ayan-muted))]">
          No bookings match your filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Services</th>
                <th className="px-5 py-3">Scheduled</th>
                <th className="px-5 py-3">Assigned Engineer</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-[rgb(var(--ayan-surface))]/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-semibold text-[rgb(var(--ayan-text))]">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-brand-600 hover:underline"
                    >
                      {b.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-[rgb(var(--ayan-text))]">{b.customer.name}</p>
                    <p className="text-xs text-[rgb(var(--ayan-muted))]">{b.postcode}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-text))] max-w-xs truncate">
                    {b.items.map((i) => i.serviceName).join(", ")}
                  </td>
                  <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                    <p>{formatDateTime(b.scheduledAt)}</p>
                    <span className="text-[10px] uppercase font-semibold text-brand-600">
                      {b.timeWindow}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {b.assignedEngineer ? (
                      <span className="font-medium text-[rgb(var(--ayan-text))]">
                        {b.assignedEngineer.user.name}
                      </span>
                    ) : (
                      <span className="italic text-amber-600">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">
                    {formatMoney(b.total)}
                  </td>
                  <td className="px-5 py-3">
                    <PaymentStatusBadge status={b.paymentStatus as never} />
                  </td>
                  <td className="px-5 py-3">
                    <BookingStatusBadge status={b.status as never} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="rounded-lg p-1.5 text-brand-600 hover:bg-[rgb(var(--ayan-surface))] hover:underline text-xs font-medium"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

