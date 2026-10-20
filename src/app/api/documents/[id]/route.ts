import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

/**
 * Secure document download. Only the document owner, an assigned engineer on
 * a booking the document belongs to, or an admin may download. Unauthorized
 * requests receive 404 (not 403) so we don't leak document existence.
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
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      booking: {
        select: {
          customerId: true,
          assignedEngineerId: true,
          assignedEngineer: { select: { userId: true } },
        },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let authorized = false;

  // Owner-based access
  if (document.ownerUserId === session.sub) authorized = true;

  // Booking customer
  if (document.booking?.customerId === session.sub) authorized = true;

  // Assigned engineer on the booking
  if (
    session.role === ROLES.ENGINEER &&
    document.booking?.assignedEngineer?.userId === session.sub
  ) {
    authorized = true;
  }

  // Admins can access everything
  if (session.role === ROLES.ADMIN) authorized = true;

  if (!authorized) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // In this reference implementation documents are stored by URL. If the URL
  // is relative to our own origin we serve it; external URLs are redirected.
  if (/^https?:\/\//.test(document.url)) {
    return NextResponse.redirect(document.url);
  }

  return NextResponse.json(
    { error: "Document storage not configured for direct download." },
    { status: 501 },
  );
}
