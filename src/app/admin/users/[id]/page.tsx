import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/server/admin";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { UserDetailClient } from "./UserDetailClient";
import { formatDateTime, formatMoney } from "@/lib/format";
import { BookingStatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAdminUser(id);

  if (!user) notFound();

  return (
    <>
      <PageHeader
        title={user.name}
        description={`Account profile for ${user.email} · Registered ${formatDateTime(user.createdAt)}`}
        actions={
          <Link
            href="/admin/users"
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            ← Back to Users
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Controls & Review */}
        <div className="lg:col-span-2 space-y-8">
          <UserDetailClient
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              status: user.status,
              engineer: user.engineer
                ? {
                    id: user.engineer.id,
                    status: user.engineer.status,
                    reviewNotes: user.engineer.reviewNotes,
                    qualifications: user.engineer.qualifications,
                  }
                : null,
            }}
          />

          {/* Bookings History */}
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))] mb-1">
              Associated Bookings ({user.bookings.length})
            </h3>
            <p className="text-xs text-[rgb(var(--ayan-muted))] mb-4">
              All bookings created by or assigned to this user.
            </p>

            {user.bookings.length === 0 ? (
              <p className="text-xs text-[rgb(var(--ayan-muted))]">No bookings found.</p>
            ) : (
              <div className="divide-y divide-[rgb(var(--ayan-border))]">
                {user.bookings.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="font-mono font-semibold text-brand-600 hover:underline"
                      >
                        {b.reference}
                      </Link>
                      <p className="text-xs text-[rgb(var(--ayan-muted))]">
                        {b.items.map((i) => i.serviceName).join(", ")} · {formatMoney(b.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookingStatusBadge status={b.status as never} />
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="text-xs text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Profile Information */}
        <div className="space-y-6">
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))] mb-3">
              Profile Summary
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[rgb(var(--ayan-muted))]">User ID:</span>
                <p className="font-mono font-medium text-[rgb(var(--ayan-text))]">{user.id}</p>
              </div>
              <div>
                <span className="text-[rgb(var(--ayan-muted))]">Full Name:</span>
                <p className="font-medium text-[rgb(var(--ayan-text))]">{user.name}</p>
              </div>
              <div>
                <span className="text-[rgb(var(--ayan-muted))]">Email:</span>
                <p className="font-medium text-[rgb(var(--ayan-text))]">{user.email}</p>
              </div>
              <div>
                <span className="text-[rgb(var(--ayan-muted))]">Phone:</span>
                <p className="font-medium text-[rgb(var(--ayan-text))]">{user.phone || "Not provided"}</p>
              </div>
              <div>
                <span className="text-[rgb(var(--ayan-muted))]">Email Verified:</span>
                <p className="font-medium text-[rgb(var(--ayan-text))]">
                  {user.emailVerifiedAt ? formatDateTime(user.emailVerifiedAt) : "Unverified"}
                </p>
              </div>
            </div>

            {user.customer && (
              <div className="mt-4 pt-4 border-t border-[rgb(var(--ayan-border))] space-y-2 text-xs">
                <p className="font-semibold text-[rgb(var(--ayan-text))]">Customer Profile</p>
                <div>
                  <span className="text-[rgb(var(--ayan-muted))]">Company:</span>
                  <p className="font-medium text-[rgb(var(--ayan-text))]">{user.customer.companyName || "None"}</p>
                </div>
                <div>
                  <span className="text-[rgb(var(--ayan-muted))]">Billing Email:</span>
                  <p className="font-medium text-[rgb(var(--ayan-text))]">{user.customer.billingEmail || "Default"}</p>
                </div>
              </div>
            )}

            {user.engineer && (
              <div className="mt-4 pt-4 border-t border-[rgb(var(--ayan-border))] space-y-2 text-xs">
                <p className="font-semibold text-[rgb(var(--ayan-text))]">Engineer Profile</p>
                <div>
                  <span className="text-[rgb(var(--ayan-muted))]">Headline:</span>
                  <p className="font-medium text-[rgb(var(--ayan-text))]">{user.engineer.headline || "None"}</p>
                </div>
                <div>
                  <span className="text-[rgb(var(--ayan-muted))]">Coverage:</span>
                  <p className="font-medium text-[rgb(var(--ayan-text))]">{user.engineer.coverageCities || "All"}</p>
                </div>
                <div>
                  <span className="text-[rgb(var(--ayan-muted))]">Base Postcode:</span>
                  <p className="font-medium text-[rgb(var(--ayan-text))]">{user.engineer.basePostcode || "N/A"}</p>
                </div>
              </div>
            )}
          </Card>

          {/* User Audit Log */}
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))] mb-3">
              Activity History
            </h4>
            {user.auditLogs.length === 0 ? (
              <p className="text-xs text-[rgb(var(--ayan-muted))]">No recorded actions for this user.</p>
            ) : (
              <div className="space-y-3">
                {user.auditLogs.map((log) => (
                  <div key={log.id} className="text-xs border-b border-[rgb(var(--ayan-border))] pb-2 last:border-0">
                    <p className="font-semibold text-[rgb(var(--ayan-text))]">{log.action}</p>
                    <p className="text-[rgb(var(--ayan-muted))]">{formatDateTime(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

