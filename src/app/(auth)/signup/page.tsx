"use client";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { AuthShell, FormError } from "@/components/auth/AuthShell";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signup } from "@/actions/auth";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
        <AuthShell
            title="Create account"
            subtitle="Join thousands of builders planning faster."
            footer={
                <>
                    Already have an account?{" "}
                    <Link href="/login" className="text-[color:var(--color-nebula-fg)] hover:underline">
                        Sign in
                    </Link>
                </>
            }
        >
            <form action={action} className="space-y-[var(--space-lg)]">
                <Field label="Full name" name="name" type="text" placeholder="John Doe" required />
                <Field label="Email" name="email" type="email" placeholder="name@example.com" required />
                <Field label="Password" name="password" type="password" placeholder="••••••••" required minLength={6} />

                <FormError message={state.error} />

                <Button variant="nebula" disabled={isPending} className="w-full">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
            </form>
        </AuthShell>
    );
}
