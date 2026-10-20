import { requireRole } from "@/server/guards";
import { getEngineerProfile } from "@/server/engineer";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QualificationsClient } from "./QualificationsClient";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EngineerQualificationsPage() {
  const session = await requireRole([ROLES.ENGINEER]);
  const profile = await getEngineerProfile(session.sub);

  if (!profile) return null;

  return (
    <>
      <PageHeader
        title="Qualifications & Verification"
        description="Maintain your professional licenses and insurance documents for job eligibility."
      />
      <div className="max-w-4xl">
        <QualificationsClient qualifications={profile.qualifications} />
      </div>
    </>
  );
}

