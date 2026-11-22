"use client";

/**
 * Kinetic Orange brutalist auth frame — boxless, matching the homepage's open
 * layout: white canvas, centered column, Archivo Black uppercase heading,
 * Space Mono labels, orange accent. No bordered card, no logo mark.
 */

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, X } from "lucide-react";

type KineticAuthShellProps = {
    title?: string;
    subtitle?: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
};

export function KineticAuthShell({ title, subtitle, footer, children }: KineticAuthShellProps) {
    return (
        <div className="relative min-h-screen bg-white px-4 pt-14 pb-12 md:pt-24 md:pb-20 flex flex-col items-center">
            <Link
                href="/"
                className="absolute left-4 top-4 md:left-8 md:top-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-tight text-black/50 transition-colors hover:text-[#FF4D00]"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
            </Link>

            <div className="w-full max-w-sm text-center">
                {title ? (
                    <>
                        <h1 className="type-h3">{title}</h1>
                        <div className="mx-auto mt-3 h-1 w-10 bg-[#FF4D00]" />
                    </>
                ) : null}
                {subtitle ? (
                    <p className="font-mono text-xs uppercase tracking-tight text-black/70">{subtitle}</p>
                ) : null}
            </div>

            <div className="mt-8 w-full max-w-sm">{children}</div>

            {footer ? (
                <div className="mt-8 w-full max-w-sm text-center font-mono text-xs uppercase tracking-tight text-black/70">
                    {footer}
                </div>
            ) : null}
        </div>
    );
}

/** Brutalist form field — square 2px border, Space Mono label, orange focus. */
export function KineticField({
    label,
    hint,
    error,
    toggle,
    className,
    id,
    type,
    onChange,
    ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    hint?: string;
    error?: string;
    /** Show a reveal/hide toggle (for password inputs). */
    toggle?: boolean;
}) {
    const [show, setShow] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = id ?? rest.name;
    const hasError = !!error;
    const isPassword = toggle && type === "password";

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setHasValue((e.target.value || "").length > 0);
        onChange?.(e);
    }

    function clearInput() {
        const el = inputRef.current;
        if (!el) return;
        el.value = "";
        setHasValue(false);
        // Re-run the parent's onChange so live validation clears too.
        onChange?.({ target: el } as React.ChangeEvent<HTMLInputElement>);
    }

    return (
        <div className="mb-5">
            <label htmlFor={inputId} className="mb-2 block font-mono text-xs uppercase tracking-tight text-black">
                {label}
            </label>
            <div className="relative">
                <input
                    ref={inputRef}
                    id={inputId}
                    type={isPassword ? (show ? "text" : "password") : type}
                    aria-invalid={hasError || undefined}
                    onChange={handleChange}
                    {...rest}
                    className={
                        "h-12 w-full border-2 bg-white text-sm text-black outline-none transition-colors " +
                        "placeholder:text-black/50 " +
                        (isPassword ? "pl-4 pr-24" : "pl-4 pr-10") +
                        " " +
                        (hasError ? "border-[#FF4D00]" : "border-black focus:border-[#FF4D00]") +
                        " " +
                        (className ?? "")
                    }
                />
                {hasValue ? (
                    <button
                        type="button"
                        onClick={clearInput}
                        aria-label="Clear field"
                        className={
                            "absolute top-0 h-12 w-12 grid place-items-center border-l-2 border-black text-black transition-colors hover:text-[#FF4D00] " +
                            (isPassword ? "right-12" : "right-0")
                        }
                    >
                        <X className="h-4 w-4" />
                    </button>
                ) : null}
                {isPassword ? (
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-label={show ? "Hide password" : "Show password"}
                        className="absolute right-0 top-0 h-12 w-12 grid place-items-center border-l-2 border-black text-black transition-colors hover:text-[#FF4D00]"
                    >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                ) : null}
            </div>
            {error ? (
                <p className="mt-1.5 font-mono text-[11px] uppercase tracking-tight text-[#FF4D00]">{error}</p>
            ) : hint ? (
                <p className="mt-1.5 text-xs text-black/60">{hint}</p>
            ) : null}
        </div>
    );
}

/** Inline error line for forms — orange, mono, uppercase. */
export function KineticFormError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-tight text-[#FF4D00]">{message}</p>
    );
}

/** Subtle rotating ring spinner — inherits currentColor (white on dark buttons). */
export function KineticSpinner({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className={"animate-spin " + (className ?? "h-4 w-4")}
        >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
            <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}
