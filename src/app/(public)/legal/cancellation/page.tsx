import { LegalShell } from "@/components/pages/LegalShell";
import { getSettings } from "@/server/settings";

export const metadata = {
  title: "Cancellation Policy",
  description: "How rescheduling and cancellation work on AYAN.",
};

const UPDATED = "1 January 2026";

export const dynamic = "force-dynamic";

export default async function CancellationPage() {
  const settings = await getSettings();

  return (
    <LegalShell title="Cancellation Policy" updated={UPDATED}>
      <p>
        We understand plans change. This policy explains how to reschedule or
        cancel a booking and any conditions that apply.
      </p>
      <h2>Rescheduling</h2>
      <p>
        You can reschedule a booking from your dashboard at any time before the
        scheduled appointment, subject to availability. Repeated rescheduling of
        the same booking may be limited.
      </p>
      <h2>Cancellation window</h2>
      <p>
        Bookings can be cancelled free of charge up to{" "}
        <strong>{settings.cancellationWindowHours} hours</strong> before the
        scheduled appointment. Cancellations made inside this window may incur a
        fee to cover the engineer&apos;s time.
      </p>
      <h2>How to cancel</h2>
      <ul>
        <li>Open the booking from your dashboard.</li>
        <li>Choose &quot;Cancel booking&quot; and confirm.</li>
        <li>You&apos;ll receive confirmation of the cancellation.</li>
      </ul>
      <h2>Refunds</h2>
      <p>
        Where a payment has been taken, any refund due is processed in line with
        this policy and returned to the original payment method. Refund status
        is always reflected accurately in your dashboard.
      </p>
      <h2>Contact us</h2>
      <p>
        If you need to cancel at short notice or have a special circumstance,
        please contact our support team and we&apos;ll do our best to help.
      </p>
    </LegalShell>
  );
}
