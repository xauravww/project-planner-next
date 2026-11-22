"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createUserStory, updateUserStory } from "@/actions/crud";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";
import { KineticSelect } from "@/components/ui/KineticSelect";
import { ArrowLeft, X } from "lucide-react";

export default function NewUserStory({
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
    const [acceptance, setAcceptance] = useState(initial?.acceptanceCriteria || "");
    const [priority, setPriority] = useState(initial?.priority || "must-have");
    const [points, setPoints] = useState(initial?.storyPoints ? String(initial.storyPoints) : "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError("Title and description are required");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const data = {
                title: title.trim(),
                content: content.trim(),
                acceptanceCriteria: acceptance.trim() || undefined,
                priority,
                storyPoints: points ? Number(points) : undefined,
            };
            const res = editing ? await updateUserStory(initial.id, data) : await createUserStory(projectId, data);
            if (res?.success) {
                toast.success(editing ? "User story updated" : "User story added");
                router.push(backHref || `/projects/${projectId}/stories`);
            } else {
                setError(res?.error || "Failed to save user story");
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
                href={backHref || `/projects/${projectId}/stories`}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Link>

            <h1 className="type-h3 mt-6">{editing ? "Edit user story" : "New user story"}</h1>

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
                            placeholder="e.g. As a user, I can log in"
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
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe the story…"
                        className="min-h-[120px] w-full resize-y border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                    />
                </div>

                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Acceptance criteria</label>
                    <textarea
                        value={acceptance}
                        onChange={(e) => setAcceptance(e.target.value)}
                        placeholder="What must be true for this story to be done?"
                        className="min-h-[80px] w-full resize-y border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <div>
                        <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Points</label>
                        <input
                            type="number"
                            min={1}
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            placeholder="e.g. 3"
                            className="h-12 w-full border-2 border-black bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
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
                            editing ? "Update user story" : "Add user story"
                        )}
                    </button>
                    <Link href={backHref || `/projects/${projectId}/stories`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
