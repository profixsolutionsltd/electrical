import { LegalShell } from "@/components/pages/LegalShell";
import { CookiePreferences } from "./CookiePreferences";

export const metadata = {
  title: "Cookie Preferences",
  description: "Manage your cookie preferences on AYAN.",
};

const UPDATED = "1 January 2026";

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Preferences" updated={UPDATED}>
      <CookiePreferences />
    </LegalShell>
  );
}
