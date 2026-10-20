import { requireCustomer } from "@/server/guards";
import { getCustomerProperties } from "@/server/customer";
import { PropertiesToggle } from "./PropertiesToggle";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const session = await requireCustomer();
  const properties = await getCustomerProperties(session.sub);

  return (
    <PropertiesToggle
      properties={properties.map((p) => ({
        id: p.id,
        label: p.label,
        addressLine1: p.addressLine1,
        addressLine2: p.addressLine2,
        city: p.city,
        postcode: p.postcode,
        propertyType: p.propertyType,
        bedrooms: p.bedrooms,
        isDefault: p.isDefault,
      }))}
    />
  );
}

