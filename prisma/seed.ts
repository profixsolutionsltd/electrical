/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

/**
 * AYAN development seed.
 *
 * Creates clearly-labelled SAMPLE data: an admin, a customer, a pending
 * engineer and an approved engineer, service categories/services with FAQs,
 * FAQs, testimonials (marked as sample), service areas, banners, settings and
 * system content. All passwords are the same dev-only value.
 *
 * Run with: npm run seed
 */

// Minimal .env loader so the seed works without relying on Prisma's loader
// (which only runs for Prisma CLI commands). Values already present in the
// environment take precedence.
(function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
})();

const prisma = new PrismaClient();
const DEV_PASSWORD = "Password123";

async function main() {
  console.log("Seeding AYAN development database...");
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  // --- Users -------------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@ayan.test" },
    update: {},
    create: {
      email: "admin@ayan.test",
      name: "Alex Admin",
      passwordHash,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@ayan.test" },
    update: {},
    create: {
      email: "customer@ayan.test",
      name: "Casey Customer",
      passwordHash,
      role: "CUSTOMER",
      phone: "+44 7700 900123",
      emailVerifiedAt: new Date(),
      customer: { create: { companyName: "Casey Lettings", marketingOptIn: true } },
      properties: {
        create: [
          {
            label: "Home",
            addressLine1: "12 Example Street",
            city: "London",
            postcode: "SW1A 1AA",
            propertyType: "Flat",
            bedrooms: 2,
            isDefault: true,
          },
        ],
      },
    },
  });

  const approvedEngineer = await prisma.user.upsert({
    where: { email: "engineer@ayan.test" },
    update: {},
    create: {
      email: "engineer@ayan.test",
      name: "Erin Engineer",
      passwordHash,
      role: "ENGINEER",
      phone: "+44 7700 900456",
      emailVerifiedAt: new Date(),
      engineer: {
        create: {
          headline: "Gas Safe & NICEIC qualified engineer",
          bio: "Over 10 years across residential and HMO compliance work.",
          companyName: "Erin Services Ltd",
          coverageCities: "London, Croydon, Bromley",
          basePostcode: "SW1A",
          yearsExperience: 10,
          hourlyRate: 4500,
          status: "APPROVED",
          reviewedById: admin.id,
          reviewedAt: new Date(),
          qualifications: {
            create: [
              {
                title: "Gas Safe Registration",
                issuer: "Gas Safe Register",
                reference: "GSR-SAMPLE-0001",
                verified: true,
                verifiedById: admin.id,
                verifiedAt: new Date(),
              },
            ],
          },
          availability: {
            create: [1, 2, 3, 4, 5].map((weekday) => ({
              weekday,
              startTime: "08:00",
              endTime: "18:00",
              active: true,
            })),
          },
        },
      },
    },
  });

  const pendingEngineer = await prisma.user.upsert({
    where: { email: "engineer.pending@ayan.test" },
    update: {},
    create: {
      email: "engineer.pending@ayan.test",
      name: "Paul Pending",
      passwordHash,
      role: "ENGINEER",
      emailVerifiedAt: new Date(),
      engineer: {
        create: {
          headline: "Aspiring compliance engineer",
          status: "PENDING",
          qualifications: {
            create: [{ title: "City & Guilds 2391", issuer: "City & Guilds", verified: false }],
          },
        },
      },
    },
  });

  // --- Categories --------------------------------------------------------
  const categories = [
    { name: "Gas & Heating", slug: "gas-heating", description: "Gas safety, boiler servicing and heating compliance.", icon: "flame", order: 1 },
    { name: "Electrical", slug: "electrical", description: "Electrical safety inspections and certificates.", icon: "zap", order: 2 },
    { name: "Energy", slug: "energy", description: "Energy performance certificates for sales and rentals.", icon: "leaf", order: 3 },
    { name: "Fire Safety", slug: "fire-safety", description: "Fire risk assessments, alarms and emergency lighting.", icon: "shield", order: 4 },
    { name: "Portable Appliances", slug: "portable-appliances", description: "Portable appliance testing for workplaces and lets.", icon: "plug-zap", order: 5 },
  ];
  for (const c of categories) {
    await prisma.serviceCategory.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  const gas = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "gas-heating" } });
  const electrical = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "electrical" } });
  const energy = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "energy" } });
  const fire = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "fire-safety" } });
  const pat = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "portable-appliances" } });

  // --- Services ----------------------------------------------------------
  const services = [
    { categoryId: gas.id, name: "Gas Safety Certificate", slug: "gas-safety-certificate", summary: "A legally recognised CP12 gas safety record delivered to your inbox.", description: "Our qualified engineers inspect your gas appliances, flues and pipework and issue a CP12 gas safety record the same day. Suitable for landlords and homeowners who need documented evidence of gas safety.", features: JSON.stringify(["Same-day digital certificate", "Appliance & flue inspection", "Clear remediation advice if issues are found"]), priceFrom: 2900, durationMinutes: 45, featured: true, vatApplicable: true },
    { categoryId: gas.id, name: "Boiler Service", slug: "boiler-service", summary: "A professional annual boiler service, fully documented.", description: "A thorough boiler service to keep your heating efficient and safe, with a written service record you can keep for warranty and compliance.", features: JSON.stringify(["Manufacturer-aligned service checklist", "Written service record", "Efficiency recommendations"]), priceFrom: 8900, durationMinutes: 60, featured: false, vatApplicable: true },
    { categoryId: electrical.id, name: "Electrical Safety Certificate (EICR)", slug: "electrical-safety-certificate", summary: "An Electrical Installation Condition Report, graded C1–C3.", description: "A full inspection and condition report of your electrical installation, with any hazards graded so you know exactly what needs attention.", features: JSON.stringify(["Graded C1–C3 observations", "Circuit-by-circuit testing", "Digital report within one working day"]), priceFrom: 6500, durationMinutes: 120, featured: true, vatApplicable: true },
    { categoryId: energy.id, name: "Energy Performance Certificate (EPC)", slug: "energy-performance-certificate", summary: "A domestic EPC rated A–G for sales and rentals.", description: "An accredited energy assessment of your property producing an EPC valid for ten years, ready for sales, rentals or compliance.", features: JSON.stringify(["A–G efficiency rating", "Improvement recommendations", "Lodged and delivered digitally"]), priceFrom: 7900, durationMinutes: 60, featured: false, vatApplicable: true },
    { categoryId: pat.id, name: "Portable Appliance Testing (PAT)", slug: "portable-appliance-testing", summary: "PAT testing with clear results and proper documentation.", description: "Testing of portable appliances for workplaces, rentals and commercial spaces, with itemised pass/fail results and asset labels.", features: JSON.stringify(["Itemised pass/fail results", "Asset labelling", "Suitable for workplaces & lets"]), priceFrom: 7900, durationMinutes: 90, featured: false, vatApplicable: true },
    { categoryId: fire.id, name: "Fire Risk Assessment", slug: "fire-risk-assessment", summary: "A documented fire risk assessment for your property.", description: "A structured assessment of fire risks in shared and residential buildings, with a prioritised action plan and supporting documentation.", features: JSON.stringify(["Prioritised action plan", "Suitable for HMOs & shared buildings", "Clear, documented findings"]), priceFrom: 11900, durationMinutes: 120, featured: true, vatApplicable: true },
    { categoryId: fire.id, name: "Fire Alarm Testing & Certificate", slug: "fire-alarm-testing", summary: "Fire alarm system testing and certification.", description: "Routine testing and certification of your fire alarm system to keep it functioning and documented.", features: JSON.stringify(["System function testing", "Certification for your records", "Scheduled reminders available"]), priceFrom: 10900, durationMinutes: 90, featured: false, vatApplicable: true },
    { categoryId: fire.id, name: "Emergency Lighting Testing", slug: "emergency-lighting-testing", summary: "Emergency lighting testing to keep escape routes safe.", description: "Testing and certification of emergency lighting to ensure escape routes remain illuminated when it matters.", features: JSON.stringify(["Duration & function testing", "Escape-route coverage", "Digital certificate"]), priceFrom: 10900, durationMinutes: 90, featured: false, vatApplicable: true },
  ];
  for (const s of services) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: s, create: s });
  }


  // --- Service FAQs ------------------------------------------------------
  const gasService = await prisma.service.findUniqueOrThrow({ where: { slug: "gas-safety-certificate" } });
  const serviceFaqs = [
    { serviceId: gasService.id, question: "How long does a gas safety check take?", answer: "Most appointments take around 45 minutes, depending on the number of appliances.", order: 1 },
    { serviceId: gasService.id, question: "When will I receive my certificate?", answer: "Your digital CP12 record is emailed to you the same day the job is completed.", order: 2 },
  ];
  for (const f of serviceFaqs) {
    await prisma.serviceFaq.create({ data: f }).catch(() => {});
  }

  // --- General FAQs ------------------------------------------------------
  const faqs = [
    { category: "general", question: "How quickly can I get an appointment?", answer: "Next-day appointments are often available. Availability depends on your location and the services you choose.", order: 1 },
    { category: "general", question: "When do I pay?", answer: "By default you pay on completion. Where card payment is configured you can also pay at booking.", order: 2 },
    { category: "general", question: "Are your engineers qualified?", answer: "Engineer credentials are verified by our administrators before they can receive jobs. We only display credentials that have been supplied and verified.", order: 3 },
    { category: "booking", question: "Can I reschedule or cancel?", answer: "Yes. You can reschedule or cancel from your dashboard subject to the cancellation policy in your confirmation.", order: 1 },
  ];
  for (const f of faqs) {
    await prisma.faq.create({ data: f }).catch(() => {});
  }

  // --- Testimonials (clearly labelled sample) ----------------------------
  const testimonials = [
    { authorName: "Sample Customer", authorRole: "Landlord", content: "Booking was simple and the certificate arrived the same day. (This is sample content until real reviews are available.)", rating: 5, source: "Sample content", featured: true, active: true },
    { authorName: "Sample Letting Agent", authorRole: "Agent", company: "Example Lettings", content: "A clean dashboard made managing multiple properties straightforward. (Sample content.)", rating: 5, source: "Sample content", featured: true, active: true },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t }).catch(() => {});
  }

  // --- Service areas -----------------------------------------------------
  const areas = [
    { postcodePrefix: "SW", label: "South West London", active: true },
    { postcodePrefix: "SE", label: "South East London", active: true },
    { postcodePrefix: "E", label: "East London", active: true },
    { postcodePrefix: "EC", label: "East Central London", active: true },
    { postcodePrefix: "N", label: "North London", active: true },
    { postcodePrefix: "W", label: "West London", active: true },
  ];
  for (const a of areas) {
    await prisma.serviceArea.upsert({ where: { postcodePrefix: a.postcodePrefix }, update: a, create: a });
  }

  // --- Banner ------------------------------------------------------------
  await prisma.banner.create({
    data: { message: "Next-day appointments available across London — book in minutes.", link: "/services", linkText: "View services", active: true, order: 1 },
  }).catch(() => {});

  // --- System settings ---------------------------------------------------
  const settings: [string, string, string][] = [
    ["companyName", "AYAN", "branding"],
    ["companyTagline", "Everything Managed. One Smart Platform.", "branding"],
    ["supportEmail", "support@ayan.example.com", "contact"],
    ["supportPhone", "0800 000 0000", "contact"],
    ["companyAddress", "1 AYAN House, London, United Kingdom", "contact"],
    ["currency", "GBP", "finance"],
    ["vatRate", "20", "finance"],
    ["cancellationWindowHours", "24", "booking"],
    ["slotCapacityPerWindow", "3", "booking"],
    ["bookingLeadTimeHours", "4", "booking"],
    ["serviceAreas", "SW,SE,E,EC,N,W", "coverage"],
    ["announcementEnabled", "true", "general"],
    ["premiumStatus", "COMING_SOON", "premium"],
    ["premiumLaunchWindow", "Later this year", "premium"],
    ["premiumWaitlistOpen", "true", "premium"],
  ];
  for (const [key, value, group] of settings) {
    await prisma.systemSetting.upsert({ where: { key }, update: { value, group }, create: { key, value, group } });
  }

  // --- Site content ------------------------------------------------------
  const content: [string, string, string][] = [
    ["home.hero.badge", "Trusted by landlords & agents", "home"],
    ["home.hero.title", "Everything Managed. One Smart Platform.", "home"],
    ["home.hero.subtitle", "Book gas, electrical, EPC and fire safety services through one simple platform. Exact prices, vetted engineers, next-day appointments.", "home"],
    ["home.stats.services", "12,400", "home"],
    ["home.stats.rating", "4.9", "home"],
    ["home.stats.cities", "London & surrounding", "home"],
  ];
  for (const [key, value, section] of content) {
    await prisma.siteContent.upsert({ where: { key }, update: { value, section }, create: { key, value, section } });
  }


  // --- Sample booking for the customer -----------------------------------
  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + 3);
  scheduledAt.setHours(9, 0, 0, 0);
  const subtotal = gasService.priceFrom;
  const vatAmount = Math.round((subtotal * 20) / 100);
  const total = subtotal + vatAmount;

  const booking = await prisma.booking.upsert({
    where: { reference: "AYN-SAMPLE1" },
    update: {},
    create: {
      reference: "AYN-SAMPLE1",
      customerId: customer.id,
      addressLine1: "12 Example Street",
      city: "London",
      postcode: "SW1A 1AA",
      contactName: "Casey Customer",
      contactPhone: "+44 7700 900123",
      contactEmail: "customer@ayan.test",
      status: "CONFIRMED",
      scheduledAt,
      timeWindow: "MORNING",
      subtotal,
      vatRate: 20,
      vatAmount,
      total,
      paymentStatus: "UNPAID",
      paymentMethod: "PAY_LATER",
      confirmedAt: new Date(),
      items: {
        create: [
          {
            serviceId: gasService.id,
            serviceName: gasService.name,
            quantity: 1,
            unitPrice: gasService.priceFrom,
            vatApplicable: true,
            lineTotal: gasService.priceFrom,
          },
        ],
      },
      timeline: {
        create: [
          { type: "SYSTEM", message: "Booking created" },
          { type: "STATUS_CHANGE", message: "Booking confirmed" },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { bookingId: booking.id },
    update: {},
    create: {
      bookingId: booking.id,
      number: `AYN-INV-${booking.reference.replace("AYN-", "")}`,
      subtotal,
      vatAmount,
      total,
      status: "ISSUED",
    },
  });

  await prisma.notification.create({
    data: {
      userId: customer.id,
      type: "BOOKING",
      title: "Booking confirmed",
      body: `Your booking ${booking.reference} is confirmed.`,
      link: `/dashboard/bookings/${booking.id}`,
    },
  }).catch(() => {});

  console.log("Seed complete.");
  console.log("Dev accounts (password: " + DEV_PASSWORD + "):");
  console.log("  Admin:    admin@ayan.test");
  console.log("  Customer: customer@ayan.test");
  console.log("  Engineer (approved): engineer@ayan.test");
  console.log("  Engineer (pending):  engineer.pending@ayan.test");
  void approvedEngineer;
  void pendingEngineer;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

