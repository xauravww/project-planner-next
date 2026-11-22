"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createBusinessRule, updateBusinessRule } from "@/actions/crud";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";
import { ArrowLeft, X } from "lucide-react";

export default function NewBusinessRule({
    projectId,
    initial,
    backHref,
}: {
    projectId: string;
    initial?: any;
    backHref?: string;
}) {
    const router = useRouter();
    const editing = Boolean(initial);
    const [title, setTitle] = useState(initial?.title || "");
    const [description, setDescription] = useState(initial?.description || "");
    const [condition, setCondition] = useState(initial?.condition || "");
    const [action, setAction] = useState(initial?.action || "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setError("Title and description are required");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const data = {
                title: title.trim(),
                description: description.trim(),
                condition: condition.trim() || undefined,
                action: action.trim() || undefined,
            };
            const res = editing ? await updateBusinessRule(initial.id, data) : await createBusinessRule(projectId, data);
            if (res?.success) {
                toast.success(editing ? "Rule updated" : "Rule added");
                router.push(backHref || `/projects/${projectId}/business-rules`);
            } else {
                setError(res?.error || "Failed to save rule");
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
                href={backHref || `/projects/${projectId}/business-rules`}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Link>

            <h1 className="type-h3 mt-6">{editing ? "Edit business rule" : "New business rule"}</h1>

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
                            placeholder="e.g. Payment validation"
                            className="h-12 w-full border-2 border-black bg-white px-4 pr-10 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                        />
                        {title && (
                            <button type="button" aria-label="Clear title" onClick={() => setTitle("")} className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-black transition-colors hover:text-[#FF4D00]">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What rule applies?"
                        className="min-h-[90px] w-full resize-y border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Condition</label>
                        <textarea
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            placeholder="When…"
                            className="min-h-[80px] w-full resize-y border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Action</label>
                        <textarea
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            placeholder="Then…"
                            className="min-h-[80px] w-full resize-y border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={submitting} className="nebula-btn nebula-btn--primary flex-1 justify-center disabled:opacity-60">
                        {submitting ? (
                            <>
                                <KineticSpinner className="h-4 w-4" />
                                Saving
                            </>
                        ) : (
                            editing ? "Update rule" : "Add rule"
                        )}
                    </button>
                    <Link href={backHref || `/projects/${projectId}/business-rules`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
