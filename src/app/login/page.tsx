import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/shared/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;

  return (
    <AuthShell
      eyebrow="Chapter account"
      title="Welcome back"
      description="Sign in with your chapter email or IEEE membership number."
      footer={
        <>
          <p>
            New to the hub?{" "}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-xs">
            New accounts need an Executive Committee member&apos;s approval before they can sign in.
          </p>
        </>
      }
    >
      {status === "inactive" && (
        <p className="mb-5 rounded-md border border-trace/50 bg-trace/10 px-3 py-2 text-sm" role="status">
          Your account is waiting for approval or has been deactivated. An Executive Committee member needs to approve
          it before you can sign in.
        </p>
      )}
      <LoginForm />
    </AuthShell>
  );
}
