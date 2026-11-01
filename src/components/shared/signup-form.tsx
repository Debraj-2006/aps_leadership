"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerAction } from "@/lib/actions/signup";
import { POSITION_REQUIRED_ROLES, ROLE_LABELS, SIGNUP_ROLES } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

const TIER_HINTS: Record<string, string> = {
  executive: "Runs the chapter: tenures, roster, handovers, and points, badges and tasks for members.",
  core: "Manages events and documents, and assigns tasks to Working Committee members.",
  working: "Sees the tasks assigned to you, plus your own points and badges.",
};

export function SignupForm({ positions }: { positions: string[] }) {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [tier, setTier] = useState<UserRole | null>(null);
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
      <div className="rounded-xl border bg-card p-6">
        <CheckCircle2 className="size-7 text-success" />
        <p className="mt-3 font-heading text-base font-semibold">
          {needsApproval ? "Registration submitted" : "Account created"}
        </p>
        {needsApproval ? (
          <p className="mt-1 text-sm text-muted-foreground">
            A Super Admin, Faculty Advisor or Executive Committee member needs to approve your account before you can
            sign in. You&apos;ll get a notification once it&apos;s approved.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">Your account is ready to use.</p>
            <Button nativeButton={false} render={<Link href="/login" />} className="mt-5 h-10 w-full">
              Sign in
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" required autoComplete="name" className="h-10" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="h-10" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ieee_membership_no">IEEE membership number</Label>
        <Input
          id="ieee_membership_no"
          name="ieee_membership_no"
          required
          inputMode="numeric"
          placeholder="e.g. 96100024"
          className="type-readout h-10"
        />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-3">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm password</Label>
          <Input id="confirm_password" name="confirm_password" type="password" required autoComplete="new-password" className="h-10" />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Committee tier</legend>
        <div className="grid gap-2">
          {SIGNUP_ROLES.map((r) => (
            <label
              key={r}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40",
                "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                tier === r && "border-primary bg-primary/[0.04]"
              )}
            >
              <input
                type="radio"
                name="role"
                value={r}
                required
                checked={tier === r}
                onChange={() => setTier(r)}
                className="mt-0.5 size-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium">{ROLE_LABELS[r]}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{TIER_HINTS[r]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {tier && POSITION_REQUIRED_ROLES.includes(tier) && (
        <div className="space-y-2">
          <Label>Your position</Label>
          <Select key={tier} name="position" required>
            <SelectTrigger className="h-10 w-full">
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
            placeholder="Ask your Faculty Advisor for the key"
            className="h-10"
          />
        </div>
      )}

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/[0.06] px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
