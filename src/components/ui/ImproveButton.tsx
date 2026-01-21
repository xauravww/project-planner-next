"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImproveButtonProps {
    currentText: string;
    fieldType: string; // "title", "description", "content", "steps", etc.
    onImprove: (improvedText: string) => void;
    className?: string;
}

export function ImproveButton({
    currentText,
    fieldType,
    onImprove,
    className = "",
}: ImproveButtonProps) {
    const [isImproving, setIsImproving] = useState(false);

    const handleImprove = async () => {
        if (!currentText.trim()) return;

        setIsImproving(true);
        try {
            const response = await fetch("/api/improve-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: currentText, fieldType }),
            });

            if (!response.ok) throw new Error("Failed to improve text");

            const data = await response.json();
            if (data.improvedText) {
                onImprove(data.improvedText);
            }
        } catch (error) {
            console.error("Improve text error:", error);
        } finally {
            setIsImproving(false);
        }
    };

    return (
        <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={handleImprove}
            disabled={!currentText.trim() || isImproving}
            className={`h-7 text-[10px] uppercase tracking-wider font-bold border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/40 px-2 py-0 ${className}`}
        >
            <Sparkles className={`w-3 h-3 mr-1 ${isImproving ? "animate-spin" : "text-indigo-500"}`} />
            {isImproving ? "Improving..." : "Improve"}
        </Button>
    );
}
