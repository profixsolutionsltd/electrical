import { getAdminContent } from "@/server/admin";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ContentClient } from "./ContentClient";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const content = await getAdminContent();

  return (
    <>
      <PageHeader
        title="Content Management & CMS"
        description="Edit public platform messaging, FAQs, testimonials, promotional announcement banners, and coverage areas."
      />
      <ContentClient
        faqs={content.faqs}
        testimonials={content.testimonials}
        banners={content.banners}
        serviceAreas={content.serviceAreas}
      />
    </>
  );
}

