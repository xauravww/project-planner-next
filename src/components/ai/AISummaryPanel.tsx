"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sparkles, Edit3, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useUIStore } from "@/lib/stores";

interface AISummaryPanelProps {
    entityType: "requirement" | "story" | "architecture" | "workflow" | "techStack";
    entityId: string;
    currentSummary?: string | null;
    onSave: (summary: string) => Promise<void>;
    onGenerate: () => Promise<string>;
}

export default function AISummaryPanel({
    entityType,
    entityId,
    currentSummary,
    onSave,
    onGenerate,
}: AISummaryPanelProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [summary, setSummary] = useState(currentSummary || "");
    const { isGenerating, setGenerating } = useUIStore();

    const handleGenerate = async () => {
        try {
            setGenerating(true, entityId);
            toast.loading(`Generating ${entityType} summary...`);

            const generatedSummary = await onGenerate();
            setSummary(generatedSummary);
            setIsEditing(true);

            toast.success("Summary generated!");
        } catch (error) {
            toast.error("Failed to generate summary");
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        try {
            await onSave(summary);
            setIsEditing(false);
            toast.success("Summary saved!");
        } catch (error) {
            toast.error("Failed to save summary");
            console.error(error);
        }
    };

    const handleCancel = () => {
        setSummary(currentSummary || "");
        setIsEditing(false);
    };

    return (
        <div className="bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-lg)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="type-h4 text-[color:var(--color-nebula-fg)]">AI Summary</h3>
                <div className="flex gap-2">
                    {!isEditing && !currentSummary && (
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-[var(--color-accent-orange)] hover:bg-[var(--color-accent-orange)]/90 text-white border-0"
                            size="sm"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Summary
                        </Button>
                    )}
                    {!isEditing && currentSummary && (
                        <>
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="ghost"
                                size="sm"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                variant="ghost"
                                size="sm"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Regenerate
                            </Button>
                        </>
                    )}
                    {isEditing && (
                        <>
                            <Button onClick={handleSave} size="sm" className="bg-[var(--color-accent-orange)] hover:bg-[var(--color-accent-orange)]/90 text-white border-0">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                            <Button onClick={handleCancel} variant="ghost" size="sm">
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {isEditing ? (
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full h-32 bg-[var(--color-surface-deep)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] p-3 text-[color:var(--color-nebula-fg)] resize-none focus:outline-none focus:border-[color:var(--color-accent-orange)]"
                    placeholder="Write or edit the summary..."
                />
            ) : currentSummary ? (
                <p className="type-small text-[color:var(--color-charcoal)] leading-relaxed">{currentSummary}</p>
            ) : (
                <p className="type-caption italic">
                    No summary yet. Click &quot;Generate Summary&quot; to create one with AI.
                </p>
            )}
        </div>
    );
}
