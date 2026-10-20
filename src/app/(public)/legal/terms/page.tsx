import { LegalShell } from "@/components/pages/LegalShell";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of the AYAN platform.",
};

const UPDATED = "1 January 2026";

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated={UPDATED}>
      <p>
        These Terms of Service govern your access to and use of the AYAN
        platform. By creating an account or booking a service you agree to
        these terms.
      </p>
      <h2>Using our services</h2>
      <ul>
        <li>You must provide accurate information when booking.</li>
        <li>You are responsible for the security of your account credentials.</li>
        <li>You agree not to misuse the platform or attempt to disrupt it.</li>
      </ul>
      <h2>Bookings &amp; appointments</h2>
      <p>
        Appointment availability is subject to change. Rescheduling and
        cancellation are handled in line with our Cancellation Policy. We aim to
        deliver certificates digitally once a job is completed.
      </p>
      <h2>Payments</h2>
      <p>
        Unless otherwise stated, payment is due on completion of the job. Where
        card payment is available it is processed by our payment provider. A
        booking is never treated as paid solely because a page reported success
        — payment status is always verified on our side.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, AYAN is not liable for indirect or
        consequential losses. Nothing in these terms limits liability that
        cannot be limited under applicable law.
      </p>
      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the
        platform after changes take effect constitutes acceptance of the updated
        terms.
      </p>
    </LegalShell>
  );
}
