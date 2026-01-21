"use client";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
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
        } catch (error) {
            setError("Something went wrong");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
            <Link href="/" className="mb-8 inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>

            <GlassCard className="border-white/10 bg-black w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-zinc-400">Sign in to continue planning your masterpiece.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300" htmlFor="email">
                            Email
                        </label>
                        <Input id="email" name="email" type="email" placeholder="name@example.com" required className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300" htmlFor="password">
                            Password
                        </label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" required className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all" />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-black hover:bg-zinc-200 border-0 h-10 font-bold"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-500">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-white hover:text-zinc-300 hover:underline font-medium">
                        Sign up
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
