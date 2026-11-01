import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/shared/signup-form";
import { getSignupPositions } from "@/lib/actions/signup";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const positions = await getSignupPositions();

  return (
    <AuthShell
      eyebrow="New member"
      title="Create your account"
      description="Choose your committee tier. Executive and Core members also pick their position."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm positions={positions} />
    </AuthShell>
  );
}
