import { LegalShell } from "@/components/pages/LegalShell";

export const metadata = {
  title: "Privacy Policy",
  description: "How AYAN collects, uses and protects your personal data.",
};

const UPDATED = "1 January 2026";

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated={UPDATED}>
      <p>
        This Privacy Policy explains how AYAN (&quot;we&quot;, &quot;us&quot;)
        collects, uses and protects your personal data when you use our
        platform and services.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account details such as your name, email address and phone number.</li>
        <li>Property and address information needed to deliver services.</li>
        <li>Booking, payment and invoice records.</li>
        <li>Documents and certificates you upload or that we generate for you.</li>
      </ul>
      <h2>How we use your information</h2>
      <ul>
        <li>To create and manage your account and bookings.</li>
        <li>To arrange and deliver the services you request.</li>
        <li>To process payments and issue invoices.</li>
        <li>To communicate important updates about your bookings.</li>
      </ul>
      <h2>Data security</h2>
      <p>
        We apply appropriate technical and organisational measures to protect
        your data, including hashed passwords, secure sessions and access
        controls. Documents are restricted to authorised users only.
      </p>
      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal
        data by contacting our support team. We will respond in line with
        applicable data protection law.
      </p>
      <h2>Contact</h2>
      <p>
        If you have any questions about this policy, please contact our support
        team using the details provided on this page.
      </p>
    </LegalShell>
  );
}
