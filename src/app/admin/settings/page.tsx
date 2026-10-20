import { getAdminSettings } from "@/server/admin";
import { env } from "@/lib/env";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { settings, auditLogs } = await getAdminSettings();

  return (
    <>
      <PageHeader
        title="System Settings & Audit Log"
        description="Global platform parameters, fiscal VAT settings, lead-time thresholds, and administrative audit trails."
      />
      <SettingsClient
        settings={settings}
        auditLogs={auditLogs}
        googleConfigured={env.google.isConfigured}
      />
    </>
  );
}

