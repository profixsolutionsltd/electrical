import { redirect } from "next/navigation";
import { requireCustomer } from "@/server/guards";

export const dynamic = "force-dynamic";

/** The dashboard's "Create a Booking" entry point launches the wizard. */
export default async function CreateBookingPage() {
  await requireCustomer();
  redirect("/book");
}
