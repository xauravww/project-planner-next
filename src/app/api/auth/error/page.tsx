"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { AlertTriangle, Clock } from "lucide-react";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let retryAfter = 0;
  let isRateLimit = false;

  if (error?.includes("Too many attempts")) {
    isRateLimit = true;
    const match = error.match(/(\d+)/);
    if (match) retryAfter = parseInt(match[0], 10);
  }

  const getErrorMessage = () => {
    if (isRateLimit) {
      return {
        title: "Too many attempts",
        description: `You've exceeded the maximum number of login attempts. Please try again in ${retryAfter} seconds.`,
        icon: Clock,
      };
    }

    switch (error) {
      case "CredentialsSignin":
        return {
          title: "Invalid credentials",
          description: "The email or password you entered is incorrect. Please try again.",
          icon: AlertTriangle,
        };
      case "AccessDenied":
        return {
          title: "Access denied",
          description: "You don't have permission to access this resource.",
          icon: AlertTriangle,
        };
      case "Verification":
        return {
          title: "Verification failed",
          description: "The verification token has expired or is invalid.",
          icon: AlertTriangle,
        };
      default:
        return {
          title: "Authentication error",
          description: error || "An unexpected error occurred. Please try again.",
          icon: AlertTriangle,
        };
    }
  };

  const { title, description, icon: Icon } = getErrorMessage();

  return (
    <AuthShell title={title} subtitle={description}>
      <div className="flex flex-col items-center gap-[var(--space-xl)]">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "var(--color-accent-red-glow)" }}
        >
          <Icon className="w-7 h-7 text-[color:var(--color-accent-red)]" />
        </div>

        <div className="flex flex-col gap-3 w-full">
          {!isRateLimit && (
            <Button asChild variant="nebula" className="w-full">
              <Link href="/login">Try again</Link>
            </Button>
          )}

          {isRateLimit && retryAfter > 0 && (
            <p className="type-small text-center">
              You can try again in{" "}
              <span className="text-mono text-[color:var(--color-nebula-fg)]">{retryAfter}s</span>
            </p>
          )}

          <Button asChild variant="nebula-ghost" className="w-full">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <AuthShell title="Authentication error" subtitle="Loading error details...">
        <div className="flex flex-col items-center gap-[var(--space-xl)]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--color-accent-red-glow)" }}>
            <AlertTriangle className="w-7 h-7 text-[color:var(--color-accent-red)]" />
          </div>
        </div>
      </AuthShell>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
