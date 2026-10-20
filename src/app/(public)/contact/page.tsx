import { getSettings } from "@/server/settings";
import { SectionHeading } from "@/components/ui/Section";
import { Icons } from "@/components/ui/Icons";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the AYAN team for support, sales or general enquiries.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <section className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] py-16">
        <div className="ayan-container">
          <SectionHeading
            align="left"
            eyebrow="Contact"
            title="We're here to help"
            description="Questions about a booking, a service or your account? Send us a message and our team will get back to you."
          />
        </div>
      </section>

      <section className="py-16">
        <div className="ayan-container grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6 sm:p-8">
              <h2 className="ayan-h3 text-[rgb(var(--ayan-text))]">Send us a message</h2>
              <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
                Fill in the form and we&apos;ll respond as soon as we can.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6">
              <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                Contact details
              </h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
                    <Icons.phone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium text-[rgb(var(--ayan-text))]">Phone</p>
                    <a href={`tel:${settings.supportPhone}`} className="text-[rgb(var(--ayan-muted))] hover:text-brand-600">
                      {settings.supportPhone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
                    <Icons.mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium text-[rgb(var(--ayan-text))]">Email</p>
                    <a href={`mailto:${settings.supportEmail}`} className="text-[rgb(var(--ayan-muted))] hover:text-brand-600">
                      {settings.supportEmail}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
                    <Icons.mapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium text-[rgb(var(--ayan-text))]">Head office</p>
                    <p className="text-[rgb(var(--ayan-muted))]">{settings.companyAddress}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-6">
              <h3 className="font-semibold text-[rgb(var(--ayan-text))]">Opening hours</h3>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[rgb(var(--ayan-muted))]">Mon – Fri</dt>
                  <dd className="font-medium text-[rgb(var(--ayan-text))]">8:00 – 20:00</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[rgb(var(--ayan-muted))]">Saturday</dt>
                  <dd className="font-medium text-[rgb(var(--ayan-text))]">9:00 – 17:00</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[rgb(var(--ayan-muted))]">Sunday</dt>
                  <dd className="font-medium text-[rgb(var(--ayan-muted))]">Closed</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
