"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Field";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { updateSystemSetting } from "../actions";
import { formatDateTime } from "@/lib/format";

export interface SettingItem {
  id: string;
  key: string;
  value: string;
  group: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: string | null;
  ip: string | null;
  createdAt: string | Date;
  actor: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function SettingsClient({
  settings,
  auditLogs,
  googleConfigured,
}: {
  settings: SettingItem[];
  auditLogs: AuditLogItem[];
  googleConfigured: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "audit">("settings");
  const [auditSearch, setAuditSearch] = useState("");

  const getSetting = (key: string, fallback: string) => {
    return settings.find((s) => s.key === key)?.value ?? fallback;
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const keys = [
      { key: "company_name", group: "general" },
      { key: "support_email", group: "general" },
      { key: "support_phone", group: "general" },
      { key: "vat_rate", group: "general" },
      { key: "currency", group: "general" },
      { key: "cancellation_hours", group: "general" },
      { key: "booking_notice_hours", group: "general" },
      { key: "premiumStatus", group: "premium" },
      { key: "premiumLaunchWindow", group: "premium" },
      { key: "premiumWaitlistOpen", group: "premium" },
    ];

    for (const { key, group } of keys) {
      const val = formData.get(key);
      if (val !== null) {
        await updateSystemSetting(key, String(val).trim(), group);
      }
    }

    setLoading(false);
    toast.success("Settings saved successfully");
    router.refresh();
  };

  const filteredLogs = auditLogs.filter((l) => {
    const s = auditSearch.toLowerCase();
    return (
      l.action.toLowerCase().includes(s) ||
      l.entity.toLowerCase().includes(s) ||
      (l.actor && l.actor.name.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-1 w-fit">
        <button
          onClick={() => setActiveTab("settings")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "settings"
              ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
              : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
          }`}
        >
          General & Business Settings
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "audit"
              ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
              : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {activeTab === "settings" ? (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))] mb-1">
                Business Configuration & Booking Rules
              </h3>
              <p className="text-xs text-[rgb(var(--ayan-muted))] mb-6">
                Manage global parameters, fiscal VAT rates, and cancellation policies.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    name="company_name"
                    label="Platform Brand Name"
                    defaultValue={getSetting("company_name", "AYAN")}
                    required
                  />
                  <Input
                    name="support_email"
                    label="Customer Support Email"
                    defaultValue={getSetting("support_email", "support@ayan.example.com")}
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    name="support_phone"
                    label="Support Phone Helpline"
                    defaultValue={getSetting("support_phone", "+44 20 7946 0920")}
                  />
                  <Input
                    name="currency"
                    label="Currency Code"
                    defaultValue={getSetting("currency", "GBP")}
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Input
                    name="vat_rate"
                    type="number"
                    step="0.5"
                    label="Standard VAT Rate (%)"
                    defaultValue={getSetting("vat_rate", "20")}
                    required
                  />
                  <Input
                    name="cancellation_hours"
                    type="number"
                    label="Free Cancellation Window (Hours)"
                    defaultValue={getSetting("cancellation_hours", "24")}
                    required
                  />
                  <Input
                    name="booking_notice_hours"
                    type="number"
                    label="Min. Booking Lead Time (Hours)"
                    defaultValue={getSetting("booking_notice_hours", "12")}
                    required
                  />
                </div>

                <div className="border-t border-[rgb(var(--ayan-border))] pt-6">
                  <div className="mb-1 flex items-center gap-2">
                    <Icons.crown className="h-4 w-4 text-brand-600" />
                    <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))]">
                      Premium tier
                    </h4>
                  </div>
                  <p className="mb-5 text-xs text-[rgb(var(--ayan-muted))]">
                    Premium ships as a &ldquo;coming soon&rdquo; offering. Flip the
                    status to <span className="font-mono">LIVE</span> when the
                    plan is ready to sell.
                  </p>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <Select
                      name="premiumStatus"
                      label="Premium Status"
                      defaultValue={getSetting("premiumStatus", "COMING_SOON")}
                    >
                      <option value="COMING_SOON">Coming soon</option>
                      <option value="LIVE">Live</option>
                    </Select>
                    <Input
                      name="premiumLaunchWindow"
                      label="Launch Window"
                      defaultValue={getSetting("premiumLaunchWindow", "Later this year")}
                      placeholder="Later this year"
                    />
                    <Select
                      name="premiumWaitlistOpen"
                      label="Waitlist"
                      defaultValue={getSetting("premiumWaitlistOpen", "true")}
                    >
                      <option value="true">Open</option>
                      <option value="false">Closed</option>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[rgb(var(--ayan-border))]">
                  <Button type="submit" loading={loading}>
                    Save Settings
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Infrastructure & Security Status */}
          <div className="space-y-6">
            <Card className="p-5">
              <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))] mb-3">
                Security & Infrastructure
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[rgb(var(--ayan-muted))]">Database Engine:</span>
                  <span className="font-mono font-medium text-emerald-600">SQLite (Portable / Zero-conf)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgb(var(--ayan-muted))]">Session Security:</span>
                  <span className="font-mono font-medium text-emerald-600">HMAC-SHA256 JWT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgb(var(--ayan-muted))]">Password Hashing:</span>
                  <span className="font-mono font-medium text-emerald-600">Bcrypt (cost 12)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgb(var(--ayan-muted))]">Role Enforcement:</span>
                  <span className="font-mono font-medium text-emerald-600">Server-side Guard (No client trust)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgb(var(--ayan-muted))]">Rate Limiting:</span>
                  <span className="font-mono font-medium text-emerald-600">Active</span>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="text-sm font-semibold text-[rgb(var(--ayan-text))] mb-3">
                Third-Party Integrations
              </h4>
              <p className="text-xs text-[rgb(var(--ayan-muted))] mb-3">
                Integrations operate gracefully in unconfigured mode when API keys are not supplied.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[rgb(var(--ayan-text))]">Stripe Payments:</span>
                  <span className="text-amber-600 font-medium">Unconfigured (Pay Later active)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgb(var(--ayan-text))]">SMTP Transactional Email:</span>
                  <span className="text-amber-600 font-medium">In-app notifications active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[rgb(var(--ayan-text))]">Google Sign-in:</span>
                  <span
                    className={
                      googleConfigured
                        ? "font-medium text-emerald-600"
                        : "font-medium text-amber-600"
                    }
                  >
                    {googleConfigured ? "Active" : "Unconfigured (password only)"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-[rgb(var(--ayan-border))] p-5">
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Search audit actions, entities, actors…"
              className="w-full sm:max-w-md rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-4 py-2 text-sm text-[rgb(var(--ayan-text))] placeholder-[rgb(var(--ayan-muted))] focus:border-brand-500 focus:outline-none"
            />
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-10 text-center text-sm text-[rgb(var(--ayan-muted))]">
              No audit logs match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Actor</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Entity</th>
                    <th className="px-5 py-3">Details / Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[rgb(var(--ayan-surface))]/50 transition-colors text-xs">
                      <td className="px-5 py-3 text-[rgb(var(--ayan-muted))] whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        {log.actor ? (
                          <>
                            <p className="font-semibold text-[rgb(var(--ayan-text))]">{log.actor.name}</p>
                            <p className="text-[10px] text-[rgb(var(--ayan-muted))]">{log.actor.role}</p>
                          </>
                        ) : (
                          <span className="text-[rgb(var(--ayan-muted))]">System</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">
                        {log.action}
                      </td>
                      <td className="px-5 py-3 font-mono text-[rgb(var(--ayan-muted))]">
                        {log.entity} {log.entityId ? `(${log.entityId.slice(0, 8)})` : ""}
                      </td>
                      <td className="px-5 py-3 text-[rgb(var(--ayan-muted))] font-mono max-w-xs truncate">
                        {log.metadata || "-"}
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

