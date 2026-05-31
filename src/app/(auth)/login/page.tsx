"use client";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { AuthShell, FormError } from "@/components/auth/AuthShell";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid credentials");
                setIsLoading(false);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Something went wrong");
            setIsLoading(false);
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to continue planning."
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-[color:var(--color-nebula-fg)] hover:underline">
                        Sign up
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-[var(--space-lg)]">
                <Field label="Email" name="email" type="email" placeholder="name@example.com" required />
                <Field label="Password" name="password" type="password" placeholder="••••••••" required />

                <FormError message={error} />

                <Button type="submit" variant="nebula" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
            </form>
        </AuthShell>
    );
}
