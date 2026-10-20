import { getServiceBySlug } from "@/server/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.metaTitle ?? service.name,
    description: service.metaDescription ?? service.summary,
  };
}
