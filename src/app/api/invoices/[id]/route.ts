import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSimplePdf } from "@/lib/pdf";
import { formatDate, formatMoney } from "@/lib/format";

/**
 * Secure invoice PDF download. Verifies the requesting user owns the booking
 * (or is an admin) before generating the document from real booking data.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      booking: {
        include: { items: true, customer: { select: { name: true, email: true } } },
      },
    },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = invoice.booking.customerId === session.sub;
  const isAdmin = session.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pdf = buildSimplePdf(`Invoice ${invoice.number}`, [
    { text: `Booking reference: ${invoice.booking.reference}` },
    { text: `Customer: ${invoice.booking.customer.name} (${invoice.booking.customer.email})` },
    { text: `Issued: ${formatDate(invoice.issuedAt)}`, gapBefore: 8 },
    { text: "", gapBefore: 4 },
    { text: "Items:", bold: true, gapBefore: 8 },
    ...invoice.booking.items.map((item) => ({
      text: `  ${item.serviceName} x${item.quantity} — ${formatMoney(item.lineTotal, invoice.currency)}`,
    })),
    { text: "", gapBefore: 6 },
    { text: `Subtotal: ${formatMoney(invoice.subtotal, invoice.currency)}` },
    { text: `VAT: ${formatMoney(invoice.vatAmount, invoice.currency)}` },
    { text: `Total: ${formatMoney(invoice.total, invoice.currency)}`, bold: true, gapBefore: 4 },
    { text: "", gapBefore: 10 },
    { text: "Thank you for choosing AYAN." },
  ]);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
    },
  });
}
