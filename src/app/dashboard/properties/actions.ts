"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { propertySchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

/** Create a property for the current customer. */
export async function createProperty(formData: FormData) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Not authenticated" };

  const parsed = propertySchema.safeParse({
    label: formData.get("label"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2") || undefined,
    city: formData.get("city"),
    postcode: formData.get("postcode"),
    propertyType: formData.get("propertyType") || undefined,
    bedrooms: formData.get("bedrooms") || undefined,
    notes: formData.get("notes") || undefined,
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check the property details." };
  }

  const count = await prisma.property.count({ where: { customerId: session.sub } });
  const isDefault = parsed.data.isDefault || count === 0;

  if (isDefault) {
    await prisma.property.updateMany({
      where: { customerId: session.sub, isDefault: true },
      data: { isDefault: false },
    });
  }

  await prisma.property.create({
    data: {
      customerId: session.sub,
      label: parsed.data.label,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2,
      city: parsed.data.city,
      postcode: parsed.data.postcode,
      propertyType: parsed.data.propertyType,
      bedrooms: parsed.data.bedrooms,
      notes: parsed.data.notes,
      isDefault,
    },
  });

  revalidatePath("/dashboard/properties");
  return { ok: true, message: "Property saved." };
}

/** Delete a property owned by the current customer. */
export async function deleteProperty(propertyId: string) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Not authenticated" };

  // Scoped delete — only the owner's property can be removed.
  const result = await prisma.property.deleteMany({
    where: { id: propertyId, customerId: session.sub },
  });

  revalidatePath("/dashboard/properties");
  return { ok: result.count > 0, message: result.count > 0 ? "Property removed." : "Property not found." };
}

/** Set a property as the customer's default. */
export async function setDefaultProperty(propertyId: string) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Not authenticated" };

  const property = await prisma.property.findFirst({
    where: { id: propertyId, customerId: session.sub },
  });
  if (!property) return { ok: false, message: "Property not found." };

  await prisma.$transaction([
    prisma.property.updateMany({
      where: { customerId: session.sub, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.property.update({ where: { id: propertyId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/dashboard/properties");
  return { ok: true, message: "Default property updated." };
}
