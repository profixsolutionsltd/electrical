import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminBooking, getAdminAvailableEngineers } from "@/server/admin";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { BookingDetailClient } from "./BookingDetailClient";
import { formatMoney, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [booking, engineers] = await Promise.all([
    getAdminBooking(id),
    getAdminAvailableEngineers(),
  ]);

  if (!booking) notFound();

  return (
    <>
      <PageHeader
        title={`Booking ${booking.reference}`}
        description={`Scheduled for ${formatDateTime(booking.scheduledAt)} (${booking.timeWindow})`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/bookings"
              className="text-xs font-medium text-brand-600 hover:underline mr-2"
            >
              ← Back to Bookings
            </Link>
            <BookingStatusBadge status={booking.status as never} />
            <PaymentStatusBadge status={booking.paymentStatus as never} />
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Management Controls & Services Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <BookingDetailClient
            bookingId={booking.id}
            reference={booking.reference}
            status={booking.status}
            currentEngineerId={booking.assignedEngineerId}
            availableEngineers={engineers}
            totalPence={booking.total}
          />

          {/* Services Ordered */}
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))] mb-4">
              Services & Line Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
                  <tr>
                    <th className="px-4 py-2.5">Service</th>
                    <th className="px-4 py-2.5">Qty</th>
                    <th className="px-4 py-2.5">Unit Price</th>
                    <th className="px-4 py-2.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
                  {booking.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-[rgb(var(--ayan-text))]">
                        {item.serviceName}
                      </td>
                      <td className="px-4 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        {formatMoney(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[rgb(var(--ayan-text))]">
                        {formatMoney(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 border-t border-[rgb(var(--ayan-border))] pt-4 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-[rgb(var(--ayan-muted))]">
                  <span>Subtotal</span>
                  <span>{formatMoney(booking.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[rgb(var(--ayan-muted))]">
                  <span>VAT ({booking.vatRate}%)</span>
                  <span>{formatMoney(booking.vatAmount)}</span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatMoney(booking.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-[rgb(var(--ayan-text))] border-t border-[rgb(var(--ayan-border))] pt-2">
                  <span>Total</span>
                  <span>{formatMoney(booking.total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payments & Invoices */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] pb-3 mb-4">
              <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))]">
                Payment Transactions
              </h3>
              {booking.invoice && (
                <a
                  href={`/api/invoices/${booking.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-600 hover:underline"
                >
                  Download PDF Invoice ({booking.invoice.number}) →
                </a>
              )}
            </div>

            {booking.payments.length === 0 ? (
              <p className="text-xs text-[rgb(var(--ayan-muted))]">No payments recorded yet.</p>
            ) : (
              <div className="divide-y divide-[rgb(var(--ayan-border))]">
                {booking.payments.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[rgb(var(--ayan-text))]">
                        {formatMoney(p.amount)}
                      </span>{" "}
                      <span className="text-[rgb(var(--ayan-muted))]">
                        via {p.method} {p.providerRef ? `(${p.providerRef})` : ""}
                      </span>
                      <p className="text-[rgb(var(--ayan-muted))]">{formatDateTime(p.createdAt)}</p>
                    </div>
                    <PaymentStatusBadge status={p.status as never} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar: Customer, Property, Documents, Timeline */}
        <div className="space-y-6">
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))] mb-3">
              Customer & Inspection Location
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[rgb(var(--ayan-muted))]">Customer Name:</span>
                <p className="font-medium text-[rgb(var(--ayan-text))]">{booking.contactName}</p>
              </div>
              <div>
                <span className="text-[rgb(var(--ayan-muted))]">Email:</span>
                <p className="font-medium text-[rgb(var(--ayan-text))]">{booking.contactEmail}</p>
              </div>
              <div>
                <span className="text-[rgb(var(--ayan-muted))]">Phone:</span>
                <p className="font-medium text-[rgb(var(--ayan-text))]">{booking.contactPhone}</p>
              </div>
              <div className="border-t border-[rgb(var(--ayan-border))] pt-2 mt-2">
                <span className="text-[rgb(var(--ayan-muted))]">Inspection Address:</span>
                <p className="font-medium text-[rgb(var(--ayan-text))]">
                  {booking.addressLine1}
                  {booking.addressLine2 && <>, {booking.addressLine2}</>}
                  <br />
                  {booking.city}, {booking.postcode}
                </p>
              </div>
              {booking.notes && (
                <div className="border-t border-[rgb(var(--ayan-border))] pt-2 mt-2">
                  <span className="text-[rgb(var(--ayan-muted))]">Customer Notes:</span>
                  <p className="italic text-[rgb(var(--ayan-text))]">{booking.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Assigned Engineer Details */}
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))] mb-3">
              Assigned Engineer
            </h4>
            {booking.assignedEngineer ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[rgb(var(--ayan-muted))]">Engineer Name:</span>
                  <p className="font-medium text-[rgb(var(--ayan-text))]">
                    {booking.assignedEngineer.user.name}
                  </p>
                </div>
                <div>
                  <span className="text-[rgb(var(--ayan-muted))]">Contact:</span>
                  <p className="font-medium text-[rgb(var(--ayan-text))]">
                    {booking.assignedEngineer.user.phone || booking.assignedEngineer.user.email}
                  </p>
                </div>
                <div>
                  <span className="text-[rgb(var(--ayan-muted))]">Credentials:</span>
                  <p className="text-[rgb(var(--ayan-text))]">
                    {booking.assignedEngineer.qualifications.map((q) => q.title).join(", ") ||
                      "Gas Safe Registered"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-600 italic">No engineer assigned yet.</p>
            )}
          </Card>

          {/* Documents / Certificates */}
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))] mb-3">
              Certificates & Documents ({booking.documents.length})
            </h4>
            {booking.documents.length === 0 ? (
              <p className="text-xs text-[rgb(var(--ayan-muted))]">No certificates uploaded.</p>
            ) : (
              <div className="space-y-2">
                {booking.documents.map((doc) => (
                  <div key={doc.id} className="text-xs flex items-center justify-between">
                    <span className="truncate text-[rgb(var(--ayan-text))]">{doc.filename}</span>
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 hover:underline shrink-0 ml-2"
                    >
                      Download →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))] mb-3">
              Booking Event Timeline
            </h4>
            <div className="space-y-3">
              {booking.timeline.map((event) => (
                <div key={event.id} className="text-xs border-l-2 border-brand-500 pl-3">
                  <p className="font-medium text-[rgb(var(--ayan-text))]">{event.message}</p>
                  <p className="text-[10px] text-[rgb(var(--ayan-muted))]">
                    {formatDateTime(event.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

