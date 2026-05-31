"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertTriangle, ArrowLeft, Clock } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Parse rate limit error
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
        title: "Too Many Attempts",
        description: `You've exceeded the maximum number of login attempts. Please try again in ${retryAfter} seconds.`,
        icon: Clock,
      };
    }

    switch (error) {
      case "CredentialsSignin":
        return {
          title: "Invalid Credentials",
          description: "The email or password you entered is incorrect. Please try again.",
          icon: AlertTriangle,
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          description: "You don't have permission to access this resource.",
          icon: AlertTriangle,
        };
      case "Verification":
        return {
          title: "Verification Failed",
          description: "The verification token has expired or is invalid.",
          icon: AlertTriangle,
        };
      default:
        return {
          title: "Authentication Error",
          description: error || "An unexpected error occurred. Please try again.",
          icon: AlertTriangle,
        };
    }
  };

  const { title, description, icon: Icon } = getErrorMessage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <Link 
        href="/" 
        className="mb-8 inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <GlassCard className="w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <Icon className="w-8 h-8 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
        <p className="text-zinc-400 mb-8">{description}</p>

        <div className="flex flex-col gap-3">
          {!isRateLimit && (
            <Button
              asChild
              className="bg-white text-black hover:bg-zinc-200"
            >
              <Link href="/login">Try Again</Link>
            </Button>
          )}
          
          {isRateLimit && retryAfter > 0 && (
            <div className="text-sm text-zinc-500">
              You can try again in <span className="text-white font-mono">{retryAfter}s</span>
            </div>
          )}

          <Button
            asChild
            variant="ghost"
            className="text-zinc-400 hover:text-white"
          >
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
