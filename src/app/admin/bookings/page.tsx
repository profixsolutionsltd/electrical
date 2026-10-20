import { getAdminBookings } from "@/server/admin";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BookingsClient } from "./BookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings();

  return (
    <>
      <PageHeader
        title="Bookings & Dispatch"
        description="Monitor inspection requests, assign certified engineers, track job progression, and handle exceptions."
      />
      <BookingsClient initialBookings={bookings} />
    </>
  );
}

