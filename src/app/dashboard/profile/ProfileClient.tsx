"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { initials } from "@/lib/utils";

export interface ProfileData {
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
}

/** Profile edit form. */
export function ProfileClient({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(new FormData(e.currentTarget));
    setLoading(false);
    if (result.ok) {
      toast.success("Profile updated");
      router.refresh();
    } else {
      toast.error("Couldn't update", result.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-1">
        <div className="flex flex-col items-center text-center">
          <Avatar name={profile.name} url={profile.avatarUrl} />
          <h2 className="mt-4 font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">{profile.name}</h2>
          <p className="text-sm text-[rgb(var(--ayan-muted))]">{profile.email}</p>
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              profile.emailVerified
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
            }`}
          >
            {profile.emailVerified ? <Icons.checkCircle className="h-3 w-3" /> : <Icons.alert className="h-3 w-3" />}
            {profile.emailVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Edit profile</h2>
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <Input name="name" label="Full name" defaultValue={profile.name} required />
          <Input name="email" label="Email" value={profile.email} disabled hint="Contact support to change your email." />
          <Input name="phone" label="Phone" defaultValue={profile.phone ?? ""} placeholder="+44 7700 900000" />
          <Input name="avatarUrl" label="Avatar URL" defaultValue={profile.avatarUrl ?? ""} placeholder="https://…" hint="Optional link to a profile image." />
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>Save changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className="h-20 w-20 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-900/50">
      {initials(name)}
    </span>
  );
}
