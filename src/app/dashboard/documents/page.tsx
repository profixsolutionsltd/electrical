import Link from "next/link";
import { requireCustomer } from "@/server/guards";
import { getCustomerDocuments } from "@/server/customer";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icons";
import { formatDate } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  CERTIFICATE: "Certificate",
  REPORT: "Report",
  INVOICE: "Invoice",
  QUALIFICATION: "Qualification",
  OTHER: "Document",
};

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const session = await requireCustomer();
  const documents = await getCustomerDocuments(session.sub);

  return (
    <>
      <PageHeader
        title="Documents & Certificates"
        description="Download certificates, reports and invoices for your bookings."
      />

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
            <Icons.fileText className="h-7 w-7" />
          </div>
          <h2 className="ayan-h3 mt-4 text-[rgb(var(--ayan-text))]">No documents yet</h2>
          <p className="mt-2 max-w-sm text-sm text-[rgb(var(--ayan-muted))]">
            Certificates and reports will appear here once your jobs are completed.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
                  <Icons.fileText className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[rgb(var(--ayan-surface))] px-2 py-0.5 text-xs font-medium text-[rgb(var(--ayan-muted))]">
                  {TYPE_LABELS[doc.type] ?? doc.type}
                </span>
              </div>
              <p className="mt-3 truncate font-medium text-[rgb(var(--ayan-text))]" title={doc.filename}>
                {doc.filename}
              </p>
              <p className="mt-1 text-xs text-[rgb(var(--ayan-muted))]">
                {doc.booking ? `Booking ${doc.booking.reference} · ` : ""}
                {formatDate(doc.createdAt)}
              </p>
              <a
                href={`/api/documents/${doc.id}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <Icons.download className="h-4 w-4" />
                Download
              </a>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
