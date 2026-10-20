import { requireRole } from "@/server/guards";
import { getEngineerProfile } from "@/server/engineer";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileClient } from "./ProfileClient";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EngineerProfilePage() {
  const session = await requireRole([ROLES.ENGINEER]);
  const profile = await getEngineerProfile(session.sub);

  if (!profile) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Profile & Coverage"
        description="Manage your professional bio, service areas, and company information."
      />
      <div className="max-w-3xl">
        <ProfileClient profile={profile} />
      </div>
    </>
  );
}
