import type { Metadata } from "next";
import { getServiceCatalogue } from "@/server/bookings";
import { getCurrentUser } from "@/server/session-user";
import { env } from "@/lib/env";
import { BookingWizard } from "@/features/booking/BookingWizard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a service | AYAN",
  description:
    "Book gas, electrical, fire and EPC compliance services in minutes. Pay nothing until the job is done.",
};

/**
 * The booking journey. Guests are welcome — the details we need are collected
 * inside the flow and an account is created on confirmation, so "Get Started"
 * never dead-ends on a login screen.
 */
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{
    service?: string;
    services?: string;
    step?: string;
    postcode?: string;
  }>;
}) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const catalogue = await getServiceCatalogue();

  const preselectIds = [
    ...(params.service ? [params.service] : []),
    ...(params.services ? params.services.split(",") : []),
  ]
    .map((id) => id.trim())
    .filter(Boolean);

  const requestedStep = Number.parseInt(params.step ?? "0", 10);
  const startStep =
    Number.isFinite(requestedStep) && requestedStep >= 0 && requestedStep <= 5
      ? requestedStep
      : 0;

  return (
    <BookingWizard
      catalogue={catalogue}
      user={
        user
          ? { name: user.name, email: user.email, phone: user.phone }
          : null
      }
      preselectIds={preselectIds}
      defaultPostcode={params.postcode?.trim().toUpperCase() ?? ""}
      startStep={startStep}
      cardPaymentEnabled={env.payments.isConfigured}
    />
  );
}
