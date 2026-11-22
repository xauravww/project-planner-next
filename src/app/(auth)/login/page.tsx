"use client";

import { KineticAuthShell, KineticField, KineticSpinner } from "@/components/auth/KineticAuthShell";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
    email?: string;
    password?: string;
};

function validateField(field: keyof Errors, value: string): string | undefined {
    if (field === "email") {
        if (!value.trim()) return "Email is required";
        if (!EMAIL_RE.test(value.trim())) return "Enter a valid email";
    }
    if (field === "password" && !value) return "Password is required";
    return undefined;
}

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const submittedRef = useRef(false);
    const router = useRouter();

    function onBlur(field: keyof Errors, value: string) {
        setTouched((t) => ({ ...t, [field]: true }));
        setErrors((p) => ({ ...p, [field]: validateField(field, value) }));
    }

    function onFieldChange(field: keyof Errors, value: string) {
        // Empty value: only enforce "required" once the field is touched/submitted.
        if (!value) {
            if (touched[field] || submittedRef.current) {
                setErrors((p) => ({ ...p, [field]: validateField(field, value) }));
            } else {
                setErrors((p) => ({ ...p, [field]: undefined }));
            }
            return;
        }
        // Non-empty: validate instantly as the user types.
        setErrors((p) => ({ ...p, [field]: validateField(field, value) }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        submittedRef.current = true;
        setTouched({ email: true, password: true });

        const formData = new FormData(e.currentTarget);
        const email = (formData.get("email") as string) ?? "";
        const password = (formData.get("password") as string) ?? "";

        const errs: Errors = {
            email: validateField("email", email),
            password: validateField("password", password),
        };
        setErrors(errs);
        if (errs.email || errs.password) return;

        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                email: email.trim(),
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid email or password");
                setIsLoading(false);
            } else {
                toast.success("Signed in");
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            toast.error("Something went wrong");
            setIsLoading(false);
        }
    }

    return (
        <KineticAuthShell
            subtitle="Welcome back"
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-black underline underline-offset-2 hover:text-[#FF4D00]">
                        Sign up
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} noValidate>
                <KineticField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    error={errors.email}
                    onBlur={(e) => onBlur("email", e.target.value)}
                    onChange={(e) => onFieldChange("email", e.target.value)}
                />
                <KineticField
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password}
                    toggle
                    onBlur={(e) => onBlur("password", e.target.value)}
                    onChange={(e) => onFieldChange("password", e.target.value)}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="nebula-btn nebula-btn--primary w-full justify-center transition-opacity disabled:opacity-60"
                >
                    {isLoading ? (
                        <>
                            <KineticSpinner className="h-4 w-4" />
                            Signing in
                        </>
                    ) : (
                        "Sign in"
                    )}
                </button>
            </form>
        </KineticAuthShell>
    );
}
