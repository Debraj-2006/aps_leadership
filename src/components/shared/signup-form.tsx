"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerAction } from "@/lib/actions/signup";
import { POSITION_REQUIRED_ROLES, ROLE_LABELS, SIGNUP_ROLES } from "@/lib/roles";
import type { UserRole } from "@/lib/types";
import { CheckCircle2, Loader2 } from "lucide-react";

const TIER_HINTS: Record<string, string> = {
  executive: "Full committee leadership — tenures, leadership roster, handover approvals.",
  core: "Core committee — manage events and documents for the chapter.",
  working: "Working committee / general member — view chapter activity and your own handover tasks.",
};

export function SignupForm({ positions }: { positions: string[] }) {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [tier, setTier] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) setError(result.error);
      else if (result?.success) {
        setNeedsApproval(result.requiresApproval ?? true);
        setSubmitted(true);
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/40 p-6 text-center">
        <CheckCircle2 className="size-8 text-primary" />
        <p className="font-medium">{needsApproval ? "Registration submitted" : "Account created"}</p>
        {needsApproval ? (
          <p className="text-sm text-muted-foreground">
            A Super Admin, Faculty Advisor, or Executive Committee member needs to approve your account
            before you can sign in. You&apos;ll be notified once it&apos;s approved.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your account is ready.{" "}
            <Link href="/login" className="font-medium text-primary underline underline-offset-4">
              Sign in now
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ieee_membership_no">IEEE membership number</Label>
        <Input id="ieee_membership_no" name="ieee_membership_no" required placeholder="e.g. 96100024" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm password</Label>
          <Input id="confirm_password" name="confirm_password" type="password" required autoComplete="new-password" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Committee tier</Label>
        <Select name="role" required onValueChange={setTier}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your committee tier" />
          </SelectTrigger>
          <SelectContent>
            {SIGNUP_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {tier && <p className="text-xs text-muted-foreground">{TIER_HINTS[tier]}</p>}
      </div>
      {tier && POSITION_REQUIRED_ROLES.includes(tier as UserRole) && (
        <div className="space-y-2">
          <Label>Your position</Label>
          <Select key={tier} name="position" required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your committee position" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Required for {tier === "executive" ? "Executive" : "Core"} Committee members.
          </p>
        </div>
      )}
      {tier === "executive" && (
        <div className="space-y-2">
          <Label htmlFor="executive_key">Executive access key</Label>
          <Input
            id="executive_key"
            name="executive_key"
            type="password"
            required
            autoComplete="off"
            placeholder="Enter the special key"
          />
          <p className="text-xs text-muted-foreground">
            Required for Executive Committee registration. Ask your Faculty Advisor or Super Admin.
          </p>
        </div>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
