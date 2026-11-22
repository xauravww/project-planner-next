"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createRequirement } from "@/actions/crud";
import { suggestCategory } from "@/actions/project";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";
import { KineticSelect } from "@/components/ui/KineticSelect";
import { CategoryCombobox } from "@/components/ui/CategoryCombobox";
import { ArrowLeft, X, Wand2 } from "lucide-react";

export default function NewRequirement({ projectId }: { projectId: string }) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("functional");
    const [priority, setPriority] = useState("must-have");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [category, setCategory] = useState("");
    const categories = ["Authentication", "Payments", "Core", "UX", "Data", "Integrations", "Reports"];
    const [suggesting, setSuggesting] = useState(false);
    const [suggestion, setSuggestion] = useState<{ suggested: string; matched: string | null } | null>(null);

    const aiSuggest = async () => {
        const text = `${title.trim()} ${content.trim()}`.trim();
        if (!text) {
            setError("Add a title or description first");
            return;
        }
        setError("");
        setSuggesting(true);
        setSuggestion(null);
        try {
            const res = await suggestCategory(projectId, text, categories);
            if (res?.suggested) {
                setSuggestion({ suggested: res.suggested, matched: res.matched || null });
            } else {
                setError(res?.error || "Could not suggest a category");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setSuggesting(false);
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError("Title and description are required");
            return;
        }
        setSubmitting(true);
        setError("");
        const contentFinal = category ? `Category: ${category}\n${content.trim()}` : content.trim();
        try {
            const res = await createRequirement(projectId, {
                title: title.trim(),
                content: contentFinal,
                type,
                priority,
            });
            if (res?.success) {
                toast.success("Requirement added");
                router.push(`/projects/${projectId}/requirements`);
            } else {
                setError(res?.error || "Failed to add requirement");
                setSubmitting(false);
            }
        } catch {
            setError("Something went wrong");
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl px-4 py-10 md:py-14">
            <Link
                href={`/projects/${projectId}/requirements`}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to requirements
            </Link>

            <h1 className="type-h3 mt-6">New requirement</h1>

            <form onSubmit={submit} className="mt-8 space-y-5">
                {error && (
                    <p className="border-2 border-[#FF4D00] bg-white px-4 py-2 font-mono text-xs uppercase tracking-tight text-[#FF4D00]">
                        {error}
                    </p>
                )}

                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Title</label>
                    <div className="relative">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. User authentication"
                            className="h-12 w-full border-2 border-black bg-white px-4 pr-10 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                        />
                        {title && (
                            <button
                                type="button"
                                aria-label="Clear title"
                                onClick={() => setTitle("")}
                                className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-black transition-colors hover:text-[#FF4D00]"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Description</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe the requirement in detail…"
                        className="min-h-[120px] w-full resize-y border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                    />
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className="font-mono text-xs uppercase tracking-tight text-black/70">Category</label>
                        <button
                            type="button"
                            onClick={aiSuggest}
                            disabled={suggesting}
                            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-tight text-[#FF4D00] transition-colors disabled:opacity-50"
                        >
                            {suggesting ? (
                                <>
                                    <KineticSpinner className="h-3.5 w-3.5" />
                                    Suggesting
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-3.5 w-3.5" />
                                    AI suggest
                                </>
                            )}
                        </button>
                    </div>
                    <CategoryCombobox options={categories} value={category} onChange={setCategory} />

                    {suggestion && (
                        <div className="mt-3 border-2 border-black p-3">
                            <p className="font-mono text-[11px] uppercase tracking-tight text-black/50">
                                Suggested category
                            </p>
                            <div className="mt-2 flex flex-col gap-2">
                                {suggestion.matched && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCategory(suggestion.matched!);
                                            setSuggestion(null);
                                        }}
                                        className="border-2 border-black px-3 py-2 text-left text-sm transition-colors hover:bg-black/5"
                                    >
                                        <span className="font-semibold text-black">{suggestion.matched}</span>
                                        <span className="ml-2 font-mono text-[11px] uppercase tracking-tight text-[#FF4D00]">
                                            similar to existing
                                        </span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCategory(suggestion.suggested);
                                        setSuggestion(null);
                                    }}
                                    className="border-2 border-black bg-black px-3 py-2 text-left text-sm text-white transition-colors hover:bg-[#FF4D00] hover:text-black"
                                >
                                    Use new: {suggestion.suggested}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Type</label>
                        <KineticSelect
                            value={type}
                            onChange={setType}
                            options={[
                                { value: "functional", label: "Functional" },
                                { value: "non-functional", label: "Non-functional" },
                            ]}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Priority</label>
                        <KineticSelect
                            value={priority}
                            onChange={setPriority}
                            options={[
                                { value: "must-have", label: "Must have" },
                                { value: "should-have", label: "Should have" },
                                { value: "nice-to-have", label: "Nice to have" },
                            ]}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={submitting} className="nebula-btn nebula-btn--primary flex-1 justify-center disabled:opacity-60">
                        {submitting ? (
                            <>
                                <KineticSpinner className="h-4 w-4" />
                                Adding
                            </>
                        ) : (
                            "Add requirement"
                        )}
                    </button>
                    <Link href={`/projects/${projectId}/requirements`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
