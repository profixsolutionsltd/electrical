import { getAdminUsers } from "@/server/admin";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { UsersClient } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  const formattedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    bookingsCount: u._count.bookings,
    engineer: u.engineer
      ? {
          id: u.engineer.id,
          status: u.engineer.status,
          headline: u.engineer.headline,
          qualificationsCount: u.engineer.qualifications.length,
        }
      : null,
  }));

  return (
    <>
      <PageHeader
        title="User & Engineer Directory"
        description="Oversee customer accounts, engineer applications, credential verifications, and role authorizations."
      />
      <UsersClient initialUsers={formattedUsers} />
    </>
  );
}

