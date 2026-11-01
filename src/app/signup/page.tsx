import Link from "next/link";
import { Radio, ShieldCheck, Users, FileClock } from "lucide-react";
import { SignupForm } from "@/components/shared/signup-form";
import { getSignupPositions } from "@/lib/actions/signup";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const positions = await getSignupPositions();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,theme(colors.sidebar-primary/0.35),transparent_55%),radial-gradient(circle_at_80%_80%,theme(colors.accent/0.25),transparent_50%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
            <Radio className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">IEEE AP-S</p>
            <p className="text-xs text-primary-foreground/70">Student Branch Chapter · IEM</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Request your committee account
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">
            Register with your IEEE membership number to get access to the chapter&apos;s
            leadership and transition hub. New accounts are reviewed before activation.
          </p>
          <div className="grid max-w-md grid-cols-1 gap-4 text-sm">
            <Feature icon={Users} title="Executive Committee" desc="Full leadership access — tenures, roster, handover approvals." />
            <Feature icon={FileClock} title="Core Committee" desc="Manage events and documents for the chapter." />
            <Feature icon={ShieldCheck} title="Working Committee" desc="View chapter activity and your own handover tasks." />
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} IEEE Antennas &amp; Propagation Society — IEM Student Branch Chapter.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 lg:hidden">
            <p className="text-sm font-semibold text-primary">IEEE AP-S · IEM</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              Provide your details and select your committee tier below.
            </p>
          </div>
          <SignupForm positions={positions} />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Users;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-primary-foreground/70">{desc}</p>
      </div>
    </div>
  );
}
