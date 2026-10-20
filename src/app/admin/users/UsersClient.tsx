"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { toggleUserStatus, reviewEngineer } from "../actions";
import { formatDateTime } from "@/lib/format";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string | Date;
  bookingsCount: number;
  engineer?: {
    id: string;
    status: string;
    headline: string | null;
    qualificationsCount: number;
  } | null;
}

export function UsersClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = initialUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      u.status === statusFilter ||
      (u.engineer && u.engineer.status === statusFilter);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = async (user: UserRow) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (!confirm(`Are you sure you want to mark ${user.name} as ${nextStatus}?`)) return;

    setLoadingId(user.id);
    const result = await toggleUserStatus(user.id, nextStatus as "ACTIVE" | "SUSPENDED");
    setLoadingId(null);

    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Action failed", result.message);
    }
  };

  const handleApproveEngineer = async (engineerId: string) => {
    setLoadingId(engineerId);
    const result = await reviewEngineer(engineerId, "APPROVED", "Approved by administrator");
    setLoadingId(null);

    if (result.ok) {
      toast.success("Engineer approved", result.message);
      router.refresh();
    } else {
      toast.error("Error", result.message);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-4 border-b border-[rgb(var(--ayan-border))] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone…"
            className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-4 py-2 text-sm text-[rgb(var(--ayan-text))] placeholder-[rgb(var(--ayan-muted))] focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="ENGINEER">Engineers</option>
            <option value="ADMIN">Administrators</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending Approval</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-[rgb(var(--ayan-muted))]">
          No matching users found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Bookings</th>
                <th className="px-5 py-3">Registered</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[rgb(var(--ayan-surface))]/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-[rgb(var(--ayan-text))]">{u.name}</p>
                    <p className="text-xs text-[rgb(var(--ayan-muted))]">{u.email}</p>
                    {u.phone && <p className="text-xs text-[rgb(var(--ayan-muted))]">{u.phone}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                          : u.role === "ENGINEER"
                          ? "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {u.role === "ENGINEER" && u.engineer ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.engineer.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : u.engineer.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                      >
                        Eng: {u.engineer.status}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                      >
                        {u.status}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs font-medium text-[rgb(var(--ayan-text))]">
                    {u.bookingsCount}
                  </td>
                  <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                    {formatDateTime(u.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.role === "ENGINEER" && u.engineer?.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveEngineer(u.engineer!.id)}
                          loading={loadingId === u.engineer.id}
                          className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 text-xs"
                        >
                          Approve
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(u)}
                        loading={loadingId === u.id}
                        className={`text-xs ${
                          u.status === "ACTIVE" ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </Button>

                      <Link
                        href={`/admin/users/${u.id}`}
                        className="rounded-lg p-1.5 text-brand-600 hover:bg-[rgb(var(--ayan-surface))] hover:underline text-xs font-medium"
                      >
                        Manage →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

