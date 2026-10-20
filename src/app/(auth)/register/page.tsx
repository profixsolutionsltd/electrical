import type { Metadata } from "next";
import { env } from "@/lib/env";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create your account | AYAN",
  description:
    "Create an AYAN account to book property compliance services and manage certificates.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <RegisterForm
      googleEnabled={env.google.isConfigured}
      initialError={
        params.error === "google-failed"
          ? "Google sign-up failed. Please try again or use the form below."
          : undefined
      }
    />
  );
}
