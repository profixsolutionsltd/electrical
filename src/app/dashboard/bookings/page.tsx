import Link from "next/link";
import { requireCustomer } from "@/server/guards";
import { getCustomerBookings } from "@/server/customer";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { formatDateTime, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await requireCustomer();
  const bookings = await getCustomerBookings(session.sub);

  return (
    <>
      <PageHeader
        title="My Bookings"
        description="View and manage all your bookings."
        actions={
          <Button href="/dashboard/bookings/new">
            <Icons.plus className="h-4 w-4" />
            New booking
          </Button>
        }
      />

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
            <Icons.calendar className="h-7 w-7" />
          </div>
          <h2 className="ayan-h3 mt-4 text-[rgb(var(--ayan-text))]">No bookings yet</h2>
          <p className="mt-2 max-w-sm text-sm text-[rgb(var(--ayan-muted))]">
            When you book a service it will appear here with its status, documents and invoices.
          </p>
          <Button href="/dashboard/bookings/new" className="mt-6">Create your first booking</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/bookings/${booking.id}`}
              className="block rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-5 transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-sm font-bold text-[rgb(var(--ayan-text))]">{booking.reference}</p>
                    <BookingStatusBadge status={booking.status as never} />
                  </div>
                  <p className="mt-1.5 text-sm text-[rgb(var(--ayan-muted))]">
                    {booking.items.map((i) => i.serviceName).join(", ")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgb(var(--ayan-muted))]">
                    <span className="inline-flex items-center gap-1.5">
                      <Icons.calendar className="h-3.5 w-3.5" />
                      {formatDateTime(booking.scheduledAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Icons.mapPin className="h-3.5 w-3.5" />
                      {booking.postcode}
                    </span>
                    {booking.assignedEngineer && (
                      <span className="inline-flex items-center gap-1.5">
                        <Icons.user className="h-3.5 w-3.5" />
                        {booking.assignedEngineer.user.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                  <p className="font-display text-lg font-bold text-[rgb(var(--ayan-text))]">
                    {formatMoney(booking.total, booking.currency)}
                  </p>
                  <PaymentStatusBadge status={booking.paymentStatus as never} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
