"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Field";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import {
  toggleUserStatus,
  updateUserRole,
  reviewEngineer,
  verifyQualification,
} from "../../actions";
import { formatDate } from "@/lib/format";

interface Qualification {
  id: string;
  title: string;
  issuer: string | null;
  reference: string | null;
  documentUrl: string | null;
  expiresAt: string | Date | null;
  verified: boolean;
  verifiedAt: string | Date | null;
}

export function UserDetailClient({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    engineer?: {
      id: string;
      status: string;
      reviewNotes: string | null;
      qualifications: Qualification[];
    } | null;
  };
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [engineerNotes, setEngineerNotes] = useState(user.engineer?.reviewNotes ?? "");
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleRoleChange = async () => {
    if (!confirm(`Change user role from ${user.role} to ${selectedRole}?`)) return;
    setLoading(true);
    const result = await updateUserRole(user.id, selectedRole);
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Role update failed", result.message);
    }
  };

  const handleStatusToggle = async () => {
    const next = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (!confirm(`Mark account as ${next}?`)) return;
    setLoading(true);
    const result = await toggleUserStatus(user.id, next as "ACTIVE" | "SUSPENDED");
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleEngineerReview = async (status: "APPROVED" | "PENDING" | "SUSPENDED") => {
    if (!user.engineer) return;
    setLoading(true);
    const result = await reviewEngineer(user.engineer.id, status, engineerNotes);
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleVerifyQual = async (qualId: string, currentVerified: boolean) => {
    setLoading(true);
    const result = await verifyQualification(qualId, !currentVerified);
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Permissions & Status Card */}
      <Card className="p-6">
        <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))]">
          Account Governance & Permissions
        </h3>
        <p className="text-xs text-[rgb(var(--ayan-muted))] mb-4">
          Control access tier, suspend compromised credentials, and enforce authorization policies.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-[rgb(var(--ayan-text))]">
              Role Assignment
            </label>
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="ENGINEER">ENGINEER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRoleChange}
                disabled={selectedRole === user.role}
                loading={loading}
              >
                Apply
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[rgb(var(--ayan-text))]">
              Account Status
            </label>
            <div className="flex items-center justify-between rounded-xl border border-[rgb(var(--ayan-border))] p-3">
              <span
                className={`text-xs font-semibold uppercase ${
                  user.status === "ACTIVE" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {user.status}
              </span>
              <Button
                size="sm"
                variant={user.status === "ACTIVE" ? "outline" : "primary"}
                onClick={handleStatusToggle}
                loading={loading}
                className="text-xs"
              >
                {user.status === "ACTIVE" ? "Suspend Account" : "Reactivate Account"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Engineer Application & Credentials Review */}
      {user.engineer && (
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] pb-4 mb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))]">
                Engineer Application & Vetting
              </h3>
              <p className="text-xs text-[rgb(var(--ayan-muted))]">
                Review qualifications and approve or suspend job dispatch eligibility.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                user.engineer.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : user.engineer.status === "PENDING"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              Application: {user.engineer.status}
            </span>
          </div>

          <div className="space-y-4">
            <Textarea
              label="Admin Internal Review Notes"
              rows={2}
              value={engineerNotes}
              onChange={(e) => setEngineerNotes(e.target.value)}
              placeholder="e.g. ID verified against Gas Safe register on 15/10/2026..."
            />

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleEngineerReview("APPROVED")}
                loading={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Icons.checkCircle className="h-4 w-4" />
                Approve Engineer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEngineerReview("PENDING")}
                loading={loading}
              >
                Set Pending
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEngineerReview("SUSPENDED")}
                loading={loading}
                className="text-red-600 hover:bg-red-50"
              >
                Suspend Engineer
              </Button>
            </div>
          </div>

          {/* Qualifications Sub-table */}
          <div className="mt-6 border-t border-[rgb(var(--ayan-border))] pt-4">
            <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))] mb-3">
              Submitted Qualifications & Certifications ({user.engineer.qualifications.length})
            </h4>

            {user.engineer.qualifications.length === 0 ? (
              <p className="text-xs text-[rgb(var(--ayan-muted))]">No qualifications submitted.</p>
            ) : (
              <div className="space-y-3">
                {user.engineer.qualifications.map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[rgb(var(--ayan-border))] p-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[rgb(var(--ayan-text))]">{q.title}</p>
                      <p className="text-[rgb(var(--ayan-muted))]">
                        Issuer: {q.issuer || "N/A"} · Ref: {q.reference || "N/A"}
                        {q.expiresAt && ` · Expires: ${formatDate(q.expiresAt)}`}
                      </p>
                      {q.documentUrl && (
                        <a
                          href={q.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:underline mt-1 inline-block"
                        >
                          View submitted document →
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          q.verified
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {q.verified ? "Verified" : "Unverified"}
                      </span>
                      <Button
                        size="sm"
                        variant={q.verified ? "outline" : "primary"}
                        onClick={() => handleVerifyQual(q.id, q.verified)}
                        loading={loading}
                        className="text-xs"
                      >
                        {q.verified ? "Revoke Verification" : "Verify Document"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

