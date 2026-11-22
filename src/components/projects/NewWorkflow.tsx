"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createWorkflow, updateWorkflow } from "@/actions/crud";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";
import { ArrowLeft, X } from "lucide-react";

export default function NewWorkflow({
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
    const [content, setContent] = useState(initial?.content || "");
    const [diagram, setDiagram] = useState(initial?.diagram || "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError("Title and steps are required");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const data = { title: title.trim(), content: content.trim(), diagram: diagram.trim() || undefined };
            const res = editing ? await updateWorkflow(initial.id, data) : await createWorkflow(projectId, data);
            if (res?.success) {
                toast.success(editing ? "Workflow updated" : "Workflow added");
                router.push(backHref || `/projects/${projectId}/workflows`);
            } else {
                setError(res?.error || "Failed to save workflow");
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
                href={backHref || `/projects/${projectId}/workflows`}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Link>

            <h1 className="type-h3 mt-6">{editing ? "Edit workflow" : "New workflow"}</h1>

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
                            placeholder="e.g. User onboarding flow"
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
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Steps (one per line)</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={"Step 1: User logs in\nStep 2: User opens dashboard"}
                        className="min-h-[150px] w-full resize-y border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                    />
                </div>

                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Diagram (Mermaid, optional)</label>
                    <textarea
                        value={diagram}
                        onChange={(e) => setDiagram(e.target.value)}
                        placeholder={"flowchart TD\n  A[Start] --> B[Process]\n  B --> C[End]"}
                        className="min-h-[120px] w-full resize-y border-2 border-black bg-white px-4 py-3 font-mono text-xs text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={submitting} className="nebula-btn nebula-btn--primary flex-1 justify-center disabled:opacity-60">
                        {submitting ? (
                            <>
                                <KineticSpinner className="h-4 w-4" />
                                Saving
                            </>
                        ) : (
                            editing ? "Update workflow" : "Add workflow"
                        )}
                    </button>
                    <Link href={backHref || `/projects/${projectId}/workflows`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
