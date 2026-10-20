import { getAdminFinance } from "@/server/admin";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Icons } from "@/components/ui/Icons";
import { FinanceClient } from "./FinanceClient";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const finance = await getAdminFinance();

  return (
    <>
      <PageHeader
        title="Finance & Invoices"
        description="Monitor settled payment transactions, outstanding balances, refunds, and VAT accounting."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Settled Revenue"
          value={formatMoney(finance.totalReceived)}
          icon={Icons.creditCard}
          tone="success"
          hint="Net collected"
        />
        <StatCard
          label="Pending Payments"
          value={formatMoney(finance.pendingPayments)}
          icon={Icons.clock}
          tone="warning"
          hint="Unpaid / Pay Later"
        />
        <StatCard
          label="Total Refunded"
          value={formatMoney(finance.refundedTotal)}
          icon={Icons.close}
          tone="neutral"
        />
        <StatCard
          label="Invoices Generated"
          value={finance.invoices.length}
          icon={Icons.document}
          tone="brand"
        />
      </div>

      <FinanceClient
        payments={finance.payments}
        invoices={finance.invoices}
      />
    </>
  );
}
