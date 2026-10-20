import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Icons } from "@/components/ui/Icons";

/**
 * Announcement bar shown at the very top of public pages. Reads the active
 * banner from the database so admins can control it without a deploy.
 */
export async function AnnouncementBar({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  const banner = await prisma.banner.findFirst({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] },
      ],
    },
    orderBy: { order: "asc" },
  });

  if (!banner) return null;

  return (
    <div className="bg-gradient-brand text-white">
      <div className="ayan-container flex items-center justify-center gap-3 py-2 text-center text-sm">
        <Icons.info className="hidden h-4 w-4 sm:block" />
        <p className="font-medium">{banner.message}</p>
        {banner.link && (
          <Link
            href={banner.link}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold hover:bg-white/25"
          >
            {banner.linkText || "Learn more"}
            <Icons.arrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
