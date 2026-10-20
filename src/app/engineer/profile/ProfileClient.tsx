"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEngineerProfile } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Field";
import { EngineerStatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";

export interface EngineerProfileData {
  headline: string | null;
  bio: string | null;
  companyName: string | null;
  basePostcode: string | null;
  coverageCities: string | null;
  yearsExperience: number | null;
  status: string;
}

/** Engineer profile edit form. */
export function ProfileClient({ profile }: { profile: EngineerProfileData }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateEngineerProfile(new FormData(e.currentTarget));
    setLoading(false);
    if (result.ok) {
      toast.success("Profile updated");
      router.refresh();
    } else {
      toast.error("Couldn't update", result.message);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Your engineer profile</h2>
        <EngineerStatusBadge status={profile.status as never} />
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <Input name="headline" label="Headline" defaultValue={profile.headline ?? ""} placeholder="e.g. Gas Safe & NICEIC qualified engineer" />
        <Textarea name="bio" label="Bio" rows={4} defaultValue={profile.bio ?? ""} placeholder="Tell customers about your experience…" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input name="companyName" label="Company name" defaultValue={profile.companyName ?? ""} />
          <Input name="basePostcode" label="Base postcode" defaultValue={profile.basePostcode ?? ""} />
          <Input name="coverageCities" label="Coverage areas" defaultValue={profile.coverageCities ?? ""} placeholder="London, Croydon…" />
          <Input name="yearsExperience" type="number" label="Years of experience" defaultValue={profile.yearsExperience ?? ""} min={0} max={60} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>Save profile</Button>
        </div>
      </form>
    </Card>
  );
}
