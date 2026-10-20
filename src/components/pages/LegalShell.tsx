import { getSettings } from "@/server/settings";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/** Shared shell for legal / policy pages. */
export async function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <>
      <div className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] py-10">
        <div className="ayan-container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
          <h1 className="ayan-h2 mt-4 text-[rgb(var(--ayan-text))]">{title}</h1>
          <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">Last updated: {updated}</p>
        </div>
      </div>
      <div className="ayan-container py-12">
        <div className="prose-sm mx-auto max-w-3xl space-y-6 text-[rgb(var(--ayan-text))] [&_h2]:ayan-h3 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[rgb(var(--ayan-text))] [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_p]:text-[rgb(var(--ayan-muted))] [&_ul]:space-y-2">
          {children}
        </div>
        <p className="mx-auto mt-12 max-w-3xl text-xs text-[rgb(var(--ayan-muted))]">
          Questions about this policy? Contact us at{" "}
          <a href={`mailto:${settings.supportEmail}`} className="text-brand-600 hover:underline">
            {settings.supportEmail}
          </a>
          .
        </p>
      </div>
    </>
  );
}
