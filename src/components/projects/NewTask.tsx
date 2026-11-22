"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createTask, updateTask } from "@/actions/crud";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";
import { KineticSelect } from "@/components/ui/KineticSelect";
import { ArrowLeft, X } from "lucide-react";

export default function NewTask({
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
    const [priority, setPriority] = useState(initial?.priority || "MEDIUM");
    const [status, setStatus] = useState(initial?.status || "TODO");
    const [assignee, setAssignee] = useState(initial?.assignee || "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const data = {
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                status,
                assignee: assignee.trim() || undefined,
            };
            const res = editing ? await updateTask(initial.id, data) : await createTask(projectId, data);
            if (res?.success) {
                toast.success(editing ? "Task updated" : "Task added");
                router.push(backHref || `/projects/${projectId}/tasks`);
            } else {
                setError(res?.error || "Failed to save task");
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
                href={backHref || `/projects/${projectId}/tasks`}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Link>

            <h1 className="type-h3 mt-6">{editing ? "Edit task" : "New task"}</h1>

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
                            placeholder="e.g. Implement login flow"
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
                        placeholder="What does this task involve?"
                        className="min-h-[100px] w-full resize-y border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Priority</label>
                        <KineticSelect
                            value={priority}
                            onChange={setPriority}
                            options={[
                                { value: "LOW", label: "Low" },
                                { value: "MEDIUM", label: "Medium" },
                                { value: "HIGH", label: "High" },
                            ]}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Status</label>
                        <KineticSelect
                            value={status}
                            onChange={setStatus}
                            options={[
                                { value: "TODO", label: "To do" },
                                { value: "IN_PROGRESS", label: "In progress" },
                                { value: "DONE", label: "Done" },
                            ]}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Assignee</label>
                    <input
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        placeholder="Recommended role or person"
                        className="h-12 w-full border-2 border-black bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
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
                            editing ? "Update task" : "Add task"
                        )}
                    </button>
                    <Link href={backHref || `/projects/${projectId}/tasks`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
