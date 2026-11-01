import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/shared/login-form";

export default function LoginPage() {
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
            Can&apos;t sign in? Ask your Faculty Advisor or an Executive Committee member to check your account.
          </p>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
