import type { Metadata } from "next";
import { SetPasswordForm } from "./SetPasswordForm";

export const metadata: Metadata = {
  title: "Set your password | AYAN",
  description: "Choose a password for your AYAN account.",
};

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <SetPasswordForm token={token ?? ""} />;
}
