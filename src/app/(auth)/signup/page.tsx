"use client";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { signup } from "@/actions/auth";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type State = {
    error: string;
    success: boolean;
};

const initialState: State = {
    error: "",
    success: false,
};

export default function SignupPage() {
    const [state, action, isPending] = useActionState(async (prevState: State, formData: FormData) => {
        const result = await signup(formData);
        if (result.error) {
            return { ...prevState, error: result.error, success: false };
        }
        return { ...prevState, error: "", success: true };
    }, initialState);

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push("/login");
        }
    }, [state.success, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
            <Link href="/" className="mb-8 inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>

            <GlassCard className="border-white/10 bg-black w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-white tracking-tight">Create Account</h1>
                    <p className="text-sm text-zinc-400">Join thousands of visionary planners.</p>
                </div>

                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300" htmlFor="name">
                            Full Name
                        </label>
                        <Input id="name" name="name" type="text" placeholder="John Doe" required className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all" />
                    </div>
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
                        <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all" />
                    </div>

                    {state.error && (
                        <p className="text-sm text-red-400 text-center">{state.error}</p>
                    )}

                    <Button
                        disabled={isPending}
                        className="w-full bg-white text-black hover:bg-zinc-200 border-0 h-10 font-bold"
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-white hover:text-zinc-300 hover:underline font-medium">
                        Sign in
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
