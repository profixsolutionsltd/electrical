/**
 * End-to-end smoke test for the guest booking journey.
 * Run with: node_modules/.bin/ts-node -r tsconfig-paths/register scripts/booking-smoke.ts
 */
import { prisma } from "@/lib/prisma";
import { priceBooking, createBooking, getServiceCatalogue } from "@/server/bookings";

async function main() {
  const catalogue = await getServiceCatalogue();
  const service = catalogue.flatMap((c) => c.services)[0];
  if (!service) throw new Error("No published services in the catalogue");

  console.log("service:", service.name, "base:", service.priceFrom);

  // 1. Attach a booking question to the service.
  const questions = [
    {
      id: "smoke_appliances",
      label: "How many appliances do you have?",
      type: "number",
      required: true,
      min: 1,
      basePrice: 1000,
      unitPrice: 500,
    },
  ];
  const originalQuestions = await prisma.service.findUnique({
    where: { id: service.id },
    select: { questions: true },
  });
  await prisma.service.update({
    where: { id: service.id },
    data: { questions: JSON.stringify(questions) },
  });

  // 2. Create a discount code.
  const code = "SMOKE10";
  await prisma.discountCode.upsert({
    where: { code },
    update: {},
    create: {
      code,
      description: "Smoke test discount",
      type: "PERCENT",
      value: 10,
      active: true,
    },
  });

  // 3. Quote with answers + discount.
  const quote = await priceBooking(
    [{ serviceId: service.id, answers: { smoke_appliances: 2 } }],
    { discountCode: code },
  );
  console.log("quote items:", JSON.stringify(quote.items));
  console.log("quote totals:", JSON.stringify(quote.totals));
  console.log("quote discount:", JSON.stringify(quote.discount));

  // 4. Create a guest booking.
  const email = `smoke-${Date.now()}@example.com`;
  const result = await createBooking({
    serviceLines: [
      { serviceId: service.id, answers: { smoke_appliances: 2 } },
    ],
    addressLine1: "1 Test Street",
    city: "London",
    postcode: "SW1A 1AA",
    contactName: "Smoke Tester",
    contactPhone: "07000000000",
    contactEmail: email,
    scheduledDate: "2026-11-02",
    timeWindow: "MORNING",
    paymentMethod: "PAY_LATER",
    discountCode: code,
  });

  if (!result.ok) throw new Error(`createBooking failed: ${result.error}`);

  console.log("booking reference:", result.booking.reference);
  console.log("booking total:", result.booking.total, "discount:", result.booking.discount);
  console.log("account created:", result.accountCreated, "token:", Boolean(result.setPasswordToken));

  const customer = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, customer: { select: { id: true } } },
  });
  console.log("customer:", JSON.stringify(customer));

  const used = await prisma.discountCode.findUnique({ where: { code } });
  console.log("discount usedCount:", used?.usedCount);

  // 5. Clean up.
  await prisma.booking.delete({ where: { id: result.booking.id } });
  await prisma.discountCode.delete({ where: { code } });
  await prisma.service.update({
    where: { id: service.id },
    data: { questions: originalQuestions?.questions ?? null },
  });
  if (customer) {
    await prisma.user.delete({ where: { id: customer.id } });
  }

  console.log("SMOKE OK");
}

main()
  .catch((error) => {
    console.error("SMOKE FAILED", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
