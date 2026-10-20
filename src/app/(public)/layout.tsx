import { PublicShell } from "@/components/layout/PublicShell";
import { getSettings } from "@/server/settings";

/**
 * Layout for all public (unauthenticated) pages: adds the announcement bar,
 * header and footer. Authenticated areas live in their own route groups with
 * dedicated shells.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return <PublicShell settings={settings}>{children}</PublicShell>;
}
