"use client";

/**
 * Sonner Toaster themed to the Kinetic Orange brutalist system:
 * black fill, 2px orange border, mono uppercase text, orange icons,
 * sharp corners. Used globally via the root layout.
 */

import { Toaster } from "sonner";
import { Check, X } from "lucide-react";

export function ThemedToaster() {
    return (
        <Toaster
            position="bottom-right"
            gap={10}
            offset={16}
            icons={{
                success: <Check className="h-4 w-4 text-[#FF4D00]" />,
                error: <X className="h-4 w-4 text-[#FF4D00]" />,
            }}
            toastOptions={{
                style: {
                    background: "#000",
                    color: "#fff",
                    border: "2px solid #FF4D00",
                    borderRadius: "0",
                    fontFamily: "var(--font-mono), 'Space Mono', monospace",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                },
            }}
        />
    );
}
