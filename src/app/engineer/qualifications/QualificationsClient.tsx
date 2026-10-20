"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addQualification, deleteQualification } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { formatDate } from "@/lib/format";

export interface QualificationItem {
  id: string;
  title: string;
  issuer: string | null;
  reference: string | null;
  documentUrl: string | null;
  expiresAt: string | Date | null;
  verified: boolean;
  verifiedAt: string | Date | null;
}

export function QualificationsClient({ qualifications }: { qualifications: QualificationItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addQualification(formData);
    setLoading(false);

    if (result.ok) {
      toast.success("Submitted", result.message);
      setShowAddModal(false);
      router.refresh();
    } else {
      toast.error("Submission failed", result.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this qualification?")) return;
    setDeletingId(id);
    const result = await deleteQualification(id);
    setDeletingId(null);

    if (result.ok) {
      toast.success("Removed", result.message);
      router.refresh();
    } else {
      toast.error("Error", result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
            Accreditations & Certificates
          </h2>
          <p className="text-sm text-[rgb(var(--ayan-muted))]">
            Submit your Gas Safe, NICEIC, F-Gas, or other regulatory certifications for administrator verification.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Icons.plus className="h-4 w-4" />
          Add Qualification
        </Button>
      </div>

      {qualifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
            <Icons.shieldCheck className="h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold text-[rgb(var(--ayan-text))]">No qualifications added yet</p>
          <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
            Add your professional licenses and certifications to get approved for jobs.
          </p>
          <Button onClick={() => setShowAddModal(true)} size="sm" className="mt-4">
            Add your first credential
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {qualifications.map((q) => (
            <Card key={q.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-[rgb(var(--ayan-text))]">{q.title}</h3>
                    {q.issuer && (
                      <p className="text-sm text-[rgb(var(--ayan-muted))]">{q.issuer}</p>
                    )}
                  </div>
                  {q.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <Icons.checkCircle className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <Icons.clock className="h-3.5 w-3.5" />
                      Pending Review
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[rgb(var(--ayan-muted))]">
                  {q.reference && (
                    <p>
                      <strong className="text-[rgb(var(--ayan-text))]">License/Reg No:</strong> {q.reference}
                    </p>
                  )}
                  {q.expiresAt && (
                    <p>
                      <strong className="text-[rgb(var(--ayan-text))]">Expires:</strong> {formatDate(q.expiresAt)}
                    </p>
                  )}
                  {q.documentUrl && (
                    <p className="truncate">
                      <strong className="text-[rgb(var(--ayan-text))]">Document:</strong>{" "}
                      <a
                        href={q.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline"
                      >
                        View file
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end border-t border-[rgb(var(--ayan-border))] pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(q.id)}
                  loading={deletingId === q.id}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                >
                  <Icons.trash className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg p-6 bg-[rgb(var(--ayan-card))] shadow-xl">
            <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] pb-4 mb-4">
              <h3 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                Add Professional Credential
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
              >
                <Icons.close className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <Input
                name="title"
                label="Qualification / Certificate Title"
                placeholder="e.g. Gas Safe Registered Engineer (CCN1)"
                required
              />
              <Input
                name="issuer"
                label="Issuing Body / Regulatory Authority"
                placeholder="e.g. Gas Safe Register, NICEIC, City & Guilds"
              />
              <Input
                name="reference"
                label="Registration / Certificate Number"
                placeholder="e.g. GSR-982341"
              />
              <Input
                name="documentUrl"
                label="Document / Proof URL or Link"
                placeholder="https://... or verification document link"
              />
              <Input
                name="expiresAt"
                type="date"
                label="Expiry Date (if applicable)"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-[rgb(var(--ayan-border))]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Submit for Verification
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
