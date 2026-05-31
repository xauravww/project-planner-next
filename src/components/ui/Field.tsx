"use client";

/**
 * Token-styled form field — label + input, Resend `text-input` shape:
 *  - surface-card bg
 *  - 1px hairline-strong border, brightening to ink on focus
 *  - 8px radius (`--r-md`), 40px tall
 *
 * Single source of truth for inputs across auth + dashboard forms.
 * Change input styling here once → every form updates.
 */

import React from "react";
import { cn } from "@/lib/utils";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    /** Optional helper / error text under the input. */
    hint?: string;
};

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
    function Field({ label, hint, id, className, ...rest }, ref) {
        const inputId = id ?? rest.name;
        return (
            <div className="space-y-[var(--space-sm)]">
                <label htmlFor={inputId} className="type-small text-[color:var(--color-nebula-fg-soft)]">
                    {label}
                </label>
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        "w-full h-10 px-3.5 rounded-[var(--r-md)]",
                        "bg-[var(--color-nebula-surface)] text-[color:var(--color-nebula-fg)]",
                        "border border-[var(--color-nebula-hairline-strong)]",
                        "type-small placeholder:text-[color:var(--color-ash)]",
                        "outline-none transition-colors",
                        "focus:border-[color:var(--color-nebula-fg)]",
                        className,
                    )}
                    style={{ transitionDuration: "var(--nebula-fast)" }}
                    {...rest}
                />
                {hint ? <p className="type-caption">{hint}</p> : null}
            </div>
        );
    },
);
