"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createMember, updateMember } from "@/actions/crud";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";
import { ArrowLeft, X } from "lucide-react";

export default function NewMember({
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
    const [name, setName] = useState(initial?.name || "");
    const [role, setRole] = useState(initial?.role || "");
    const [email, setEmail] = useState(initial?.email || "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const data = { name: name.trim(), role: role.trim(), email: email.trim() };
            const res = editing ? await updateMember(initial.id, data) : await createMember(projectId, data);
            if (res?.success) {
                toast.success(editing ? "Member updated" : "Member added");
                router.push(backHref || `/projects/${projectId}/team`);
            } else {
                setError(res?.error || "Failed to save member");
                setSubmitting(false);
            }
        } catch {
            setError("Something went wrong");
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl px-4 py-10 md:py-14">
            <Link href={backHref || `/projects/${projectId}/team`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                <ArrowLeft className="h-4 w-4" /> Back
            </Link>

            <h1 className="type-h3 mt-6">{editing ? "Edit member" : "New member"}</h1>

            <form onSubmit={submit} className="mt-8 space-y-5">
                {error && <p className="border-2 border-[#FF4D00] bg-white px-4 py-2 font-mono text-xs uppercase tracking-tight text-[#FF4D00]">{error}</p>}

                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Name</label>
                    <div className="relative">
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Smith" className="h-12 w-full border-2 border-black bg-white px-4 pr-10 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]" />
                        {name && <button type="button" aria-label="Clear name" onClick={() => setName("")} className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-black transition-colors hover:text-[#FF4D00]"><X className="h-4 w-4" /></button>}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Role</label>
                    <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Product Designer" className="h-12 w-full border-2 border-black bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]" />
                </div>

                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-tight text-black/70">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. sarah@acme.com" className="h-12 w-full border-2 border-black bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]" />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={submitting} className="nebula-btn nebula-btn--primary flex-1 justify-center disabled:opacity-60">
                        {submitting ? (<><KineticSpinner className="h-4 w-4" /> Saving</>) : (editing ? "Update member" : "Add member")}
                    </button>
                    <Link href={backHref || `/projects/${projectId}/team`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
