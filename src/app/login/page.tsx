import Link from "next/link";
import { Radio, ShieldCheck, Users, FileClock } from "lucide-react";
import { LoginForm } from "@/components/shared/login-form";

export default function LoginPage() {
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
            Leadership &amp; Tenure Transition Hub
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">
            A single home for chapter governance — committee rosters, tenure history,
            events, official documents, and seamless handover between outgoing and
            incoming leadership.
          </p>
          <div className="grid max-w-md grid-cols-1 gap-4 text-sm">
            <Feature icon={Users} title="Leadership continuity" desc="Track every tenure's executive committee and designations." />
            <Feature icon={FileClock} title="Structured handover" desc="Transfer tasks, documents, and institutional knowledge with a clear audit trail." />
            <Feature icon={ShieldCheck} title="Role-based access" desc="Super Admin, Faculty Advisor, Chairperson, EC & incoming members." />
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} IEEE Antennas &amp; Propagation Society — IEM Student Branch Chapter.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1 lg:hidden">
            <p className="text-sm font-semibold text-primary">IEEE AP-S · IEM</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in with your chapter account to access the dashboard.
            </p>
          </div>
          <LoginForm />
          <div className="rounded-lg border bg-muted/40 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Demo accounts</p>
            <p className="mt-1">
              Use any seeded chapter email or IEEE membership number with password{" "}
              <code className="rounded bg-background px-1 py-0.5 font-mono">IEEEAPS@2025</code>.
              See the Historical Archive for past office-bearers.
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            New member?{" "}
            <Link href="/signup" className="font-medium text-primary underline underline-offset-4">
              Register for an account
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Having trouble signing in? Contact your Faculty Advisor or{" "}
            <Link href="mailto:apsiem@ieee.org" className="underline underline-offset-4">
              apsiem@ieee.org
            </Link>
            .
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
