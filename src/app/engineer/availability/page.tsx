import { requireRole } from "@/server/guards";
import { getEngineerProfile } from "@/server/engineer";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AvailabilityClient } from "./AvailabilityClient";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EngineerAvailabilityPage() {
  const session = await requireRole([ROLES.ENGINEER]);
  const profile = await getEngineerProfile(session.sub);

  if (!profile) return null;

  const slots = profile.availability.map((a) => ({
    weekday: a.weekday,
    startTime: a.startTime,
    endTime: a.endTime,
    active: a.active,
  }));

  return (
    <>
      <PageHeader
        title="Availability Schedule"
        description="Set your standard weekly operating hours for incoming job dispatches."
      />
      <div className="max-w-3xl">
        <AvailabilityClient initialSlots={slots} />
      </div>
    </>
  );
}
