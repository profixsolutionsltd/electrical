import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { getCurrentUser } from "@/server/session-user";
import type { PlatformSettings } from "@/server/settings";

/**
 * Public chrome (announcement bar, header, footer). Rendered around every page
 * by the root layout. Dashboard, engineer and admin areas use their own
 * layouts, but the public header/footer still sit beneath them as a consistent
 * base — those areas render full-height shells that visually take over.
 */
export async function PublicShell({
  settings,
  children,
}: {
  settings: PlatformSettings;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar enabled={settings.announcementEnabled} />
      <Header user={user ? { name: user.name, role: user.role } : null} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
