"use client";

import { KineticAuthShell, KineticField, KineticSpinner } from "@/components/auth/KineticAuthShell";
import Link from "next/link";
import { toast } from "sonner";
import { signup } from "@/actions/auth";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type State = {
    error: string;
    success: boolean;
};

type Errors = {
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
};

const initialState: State = {
    error: "",
    success: false,
};

function validateField(field: keyof Errors, value: string): string | undefined {
    if (field === "name") {
        if (!value.trim()) return "Name is required";
    }
    if (field === "email") {
        if (!value.trim()) return "Email is required";
        if (!EMAIL_RE.test(value.trim())) return "Enter a valid email";
    }
    if (field === "password") {
        if (!value) return "Password is required";
        if (value.length < 6) return "Use at least 6 characters";
    }
    return undefined;
}

function validateConfirm(confirm: string, password: string): string | undefined {
    if (!confirm) return "Please confirm your password";
    if (confirm !== password) return "Passwords do not match";
    return undefined;
}

function inputValue(name: string): string {
    return (document.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value) ?? "";
}

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(async (prevState: State, formData: FormData) => {
        const result = await signup(formData);
        if (result.error) {
            return { ...prevState, error: result.error, success: false };
        }
        return { ...prevState, error: "", success: true };
    }, initialState);

    const [errors, setErrors] = useState<Errors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const submittedRef = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (state.error) {
            toast.error(state.error);
        }
    }, [state.error]);

    useEffect(() => {
        if (state.success) {
            toast.success("Account created, please sign in");
            router.push("/login");
        }
    }, [state.success, router]);

    function onBlur(field: keyof Errors, value: string) {
        setTouched((t) => ({ ...t, [field]: true }));
        if (field === "confirm") {
            setErrors((p) => ({ ...p, confirm: validateConfirm(value, inputValue("password")) }));
        } else {
            setErrors((p) => ({ ...p, [field]: validateField(field, value) }));
        }
    }

    function onFieldChange(field: keyof Errors, value: string) {
        const password = inputValue("password");
        const confirm = inputValue("confirm");

        setErrors((p) => {
            const next = { ...p };

            if (field === "confirm") {
                next.confirm = validateConfirm(value, password);
            } else if (!value) {
                next[field] = touched[field] || submittedRef.current ? validateField(field, value) : undefined;
            } else {
                next[field] = validateField(field, value);
            }

            // If the password changed, re-sync the confirm check live.
            if (field === "password" && (submittedRef.current || touched.confirm || confirm)) {
                next.confirm = validateConfirm(confirm, value);
            }

            return next;
        });
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        submittedRef.current = true;
        setTouched({ name: true, email: true, password: true, confirm: true });

        const formData = new FormData(e.currentTarget);
        const name = (formData.get("name") as string) ?? "";
        const email = (formData.get("email") as string) ?? "";
        const password = (formData.get("password") as string) ?? "";
        const confirm = (formData.get("confirm") as string) ?? "";

        const errs: Errors = {
            name: validateField("name", name),
            email: validateField("email", email),
            password: validateField("password", password),
            confirm: validateConfirm(confirm, password),
        };
        setErrors(errs);
        if (errs.name || errs.email || errs.password || errs.confirm) return;

        formAction(formData);
    }

    return (
        <KineticAuthShell
            subtitle="Start planning your next project"
            footer={
                <>
                    Already have an account?{" "}
                    <Link href="/login" className="text-black underline underline-offset-2 hover:text-[#FF4D00]">
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} noValidate>
                <KineticField
                    label="Full name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    error={errors.name}
                    onBlur={(e) => onBlur("name", e.target.value)}
                    onChange={(e) => onFieldChange("name", e.target.value)}
                />
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
                    hint="At least 6 characters"
                    toggle
                    onBlur={(e) => onBlur("password", e.target.value)}
                    onChange={(e) => onFieldChange("password", e.target.value)}
                />
                <KineticField
                    label="Confirm password"
                    name="confirm"
                    type="password"
                    placeholder="••••••••"
                    error={errors.confirm}
                    toggle
                    onBlur={(e) => onBlur("confirm", e.target.value)}
                    onChange={(e) => onFieldChange("confirm", e.target.value)}
                />

                <button
                    type="submit"
                    disabled={isPending}
                    className="nebula-btn nebula-btn--primary w-full justify-center transition-opacity disabled:opacity-60"
                >
                    {isPending ? (
                        <>
                            <KineticSpinner className="h-4 w-4" />
                            Creating account
                        </>
                    ) : (
                        "Create account"
                    )}
                </button>
            </form>
        </KineticAuthShell>
    );
}
