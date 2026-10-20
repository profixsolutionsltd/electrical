import { requireCustomer } from "@/server/guards";
import { getCustomerInvoices } from "@/server/customer";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Icons } from "@/components/ui/Icons";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  ISSUED: "Issued",
  PAID: "Paid",
  VOID: "Void",
};

export default async function InvoicesPage() {
  const session = await requireCustomer();
  const invoices = await getCustomerInvoices(session.sub);

  return (
    <>
      <PageHeader
        title="Invoices & Payments"
        description="View and download invoices for your bookings."
      />

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
            <Icons.receipt className="h-7 w-7" />
          </div>
          <h2 className="ayan-h3 mt-4 text-[rgb(var(--ayan-text))]">No invoices yet</h2>
          <p className="mt-2 max-w-sm text-sm text-[rgb(var(--ayan-muted))]">
            Invoices are generated automatically when you make a booking.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))]">
          <table className="w-full text-sm">
            <thead className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] text-left">
              <tr>
                <th className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">Invoice</th>
                <th className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">Booking</th>
                <th className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">Issued</th>
                <th className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">Amount</th>
                <th className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-5 py-4 font-mono font-medium text-[rgb(var(--ayan-text))]">{invoice.number}</td>
                  <td className="px-5 py-4 text-[rgb(var(--ayan-muted))]">{invoice.booking.reference}</td>
                  <td className="px-5 py-4 text-[rgb(var(--ayan-muted))]">{formatDate(invoice.issuedAt)}</td>
                  <td className="px-5 py-4 font-semibold text-[rgb(var(--ayan-text))]">{formatMoney(invoice.total, invoice.currency)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[rgb(var(--ayan-surface))] px-2.5 py-0.5 text-xs font-semibold text-[rgb(var(--ayan-text))]">
                      {STATUS_LABELS[invoice.status] ?? invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`/api/invoices/${invoice.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
                    >
                      <Icons.download className="h-4 w-4" />
                      PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
