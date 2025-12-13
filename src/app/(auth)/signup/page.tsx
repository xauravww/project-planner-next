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
        <div>
            <Link href="/" className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>

            <GlassCard className="border-white/10">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-sm text-muted-foreground">Join thousands of visionary planners.</p>
                </div>

                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300" htmlFor="name">
                            Full Name
                        </label>
                        <Input id="name" name="name" type="text" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300" htmlFor="email">
                            Email
                        </label>
                        <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300" htmlFor="password">
                            Password
                        </label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
                    </div>

                    {state.error && (
                        <p className="text-sm text-red-400 text-center">{state.error}</p>
                    )}

                    <Button
                        disabled={isPending}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
                        Sign in
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
