import { notFound } from "next/navigation";
import { requireCustomer } from "@/server/guards";
import { getCustomerBooking } from "@/server/customer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { Icons } from "@/components/ui/Icons";
import { StatusTimeline, EventLog } from "@/components/booking/StatusTimeline";
import { BookingActions } from "@/components/booking/BookingActions";
import { formatDateTime, formatMoney, formatVatRate } from "@/lib/format";
import { canBeCancelled } from "@/lib/booking";
import { canReschedule } from "@/lib/slots";
import { BOOKING_STATUS, ACTIVE_BOOKING_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCustomer();
  const { id } = await params;
  const booking = await getCustomerBooking(session.sub, id);
  if (!booking) notFound();

  const status = booking.status as typeof BOOKING_STATUS.PENDING;
  const cancellable = canBeCancelled(status) && canReschedule(booking.scheduledAt);
  const reschedulable = ACTIVE_BOOKING_STATUSES.includes(status) && canReschedule(booking.scheduledAt);

  return (
    <>
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Bookings", href: "/dashboard/bookings" }, { label: booking.reference }]} />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-[rgb(var(--ayan-text))]">{booking.reference}</h1>
            <BookingStatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">Booked on {formatDateTime(booking.createdAt)}</p>
        </div>
        <BookingActions bookingId={booking.id} canCancel={cancellable} canReschedule={reschedulable} />
      </div>

      <Card className="mb-6 p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Progress</h2>
        <StatusTimeline status={status} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Services</h2>
            <ul className="mt-4 divide-y divide-[rgb(var(--ayan-border))]">
              {booking.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-[rgb(var(--ayan-text))]">{item.serviceName}</p>
                    <p className="text-sm text-[rgb(var(--ayan-muted))]">Qty {item.quantity}</p>
                  </div>
                  <p className="font-medium text-[rgb(var(--ayan-text))]">{formatMoney(item.lineTotal, booking.currency)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Appointment & address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info icon={Icons.calendar} label="Date & time" value={formatDateTime(booking.scheduledAt)} />
              <Info icon={Icons.clock} label="Time window" value={booking.timeWindow} />
              <Info icon={Icons.mapPin} label="Address" value={`${booking.addressLine1}, ${booking.city} ${booking.postcode}`} />
              <Info icon={Icons.user} label="Engineer" value={booking.assignedEngineer?.user.name ?? "To be assigned"} />
              <Info icon={Icons.phone} label="Contact" value={booking.contactPhone} />
              <Info icon={Icons.mail} label="Email" value={booking.contactEmail} />
            </div>
            {booking.notes && (
              <div className="mt-4 rounded-lg bg-[rgb(var(--ayan-surface))] p-3 text-sm text-[rgb(var(--ayan-muted))]">
                <strong className="text-[rgb(var(--ayan-text))]">Notes:</strong> {booking.notes}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Activity</h2>
            <div className="mt-4"><EventLog events={booking.timeline} /></div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Cost summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-[rgb(var(--ayan-muted))]">Subtotal</dt><dd className="font-medium">{formatMoney(booking.subtotal, booking.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-[rgb(var(--ayan-muted))]">VAT ({formatVatRate(booking.vatRate)})</dt><dd className="font-medium">{formatMoney(booking.vatAmount, booking.currency)}</dd></div>
              {booking.discount > 0 && (<div className="flex justify-between text-emerald-600"><dt>Discount</dt><dd className="font-medium">-{formatMoney(booking.discount, booking.currency)}</dd></div>)}
              <div className="flex justify-between border-t border-[rgb(var(--ayan-border))] pt-2"><dt className="font-semibold text-[rgb(var(--ayan-text))]">Total</dt><dd className="font-display text-lg font-bold text-[rgb(var(--ayan-text))]">{formatMoney(booking.total, booking.currency)}</dd></div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--ayan-border))] pt-4">
              <span className="text-sm text-[rgb(var(--ayan-muted))]">Payment</span>
              <PaymentStatusBadge status={booking.paymentStatus as never} />
            </div>
          </Card>

          {booking.invoice && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Invoice</h2>
              <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">{booking.invoice.number}</p>
              <Button href="/dashboard/invoices" variant="outline" size="sm" className="mt-4">View invoices</Button>
            </Card>
          )}

          {booking.documents.length > 0 && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Documents</h2>
              <ul className="mt-4 space-y-2">
                {booking.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 text-sm"><Icons.fileText className="h-4 w-4 text-brand-600" /><span className="flex-1 truncate">{doc.filename}</span></li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-[rgb(var(--ayan-muted))]">{label}</p>
        <p className="truncate text-sm font-medium text-[rgb(var(--ayan-text))]">{value}</p>
      </div>
    </div>
  );
}
