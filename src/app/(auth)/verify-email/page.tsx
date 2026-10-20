import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Icons } from "@/components/ui/Icons";

export const metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your AYAN account.",
};

export const dynamic = "force-dynamic";

/**
 * Email verification. Consumes a one-time token from the query string, marks
 * the user's email as verified and shows a clear result. Honest about state —
 * invalid/expired tokens are reported rather than silently succeeding.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let status: "success" | "invalid" | "missing" = "missing";
  if (token) {
    const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if (record && !record.usedAt && record.expiresAt > new Date()) {
      await prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      });
      await prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });
      status = "success";
    } else {
      status = "invalid";
    }
  }

  return (
    <div className="text-center">
      <span
        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
          status === "success"
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50"
            : "bg-[rgb(var(--ayan-brand-soft))] text-brand-600"
        }`}
      >
        {status === "success" ? (
          <Icons.checkCircle className="h-7 w-7" />
        ) : (
          <Icons.mail className="h-7 w-7" />
        )}
      </span>

      <h1 className="ayan-h2 mt-6 text-[rgb(var(--ayan-text))]">
        {status === "success"
          ? "Email verified"
          : status === "invalid"
            ? "Link expired"
            : "Verify your email"}
      </h1>

      <div className="mt-4 text-left">
        {status === "success" && (
          <Alert tone="success">
            Thanks — your email address has been verified. You now have full
            access to your account.
          </Alert>
        )}
        {status === "invalid" && (
          <Alert tone="error">
            This verification link is invalid or has expired. You can request a
            new one from your account settings.
          </Alert>
        )}
        {status === "missing" && (
          <Alert tone="info">
            Check your inbox for a verification link to activate your account. If
            you don&apos;t see it, you can request a new one from your dashboard.
          </Alert>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button href="/dashboard" size="lg" fullWidth>
          Go to dashboard
        </Button>
        <Link
          href="/"
          className="text-sm font-medium text-[rgb(var(--ayan-muted))] hover:text-brand-600"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
