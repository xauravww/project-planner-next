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
            variant="ghost"
            size="sm"
            onClick={handleImprove}
            disabled={!currentText.trim() || isImproving}
            className={`text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 ${className}`}
        >
            <Sparkles className={`w-3 h-3 mr-1 ${isImproving ? "animate-spin" : ""}`} />
            {isImproving ? "Improving..." : "Improve"}
        </Button>
    );
}
