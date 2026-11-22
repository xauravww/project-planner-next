"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Wand2, Pencil, Trash2, Save, Code2, X, Loader2 } from "lucide-react";
import { generateTechStack } from "@/actions/project";
import { deleteTechStack, updateTechStack } from "@/actions/crud";
import { queryKeys } from "@/lib/query-client";
import { DeleteModal } from "@/components/ui/DeleteModal";

const CATEGORIES: Array<{ key: "frontend" | "backend" | "database" | "devops" | "other"; label: string }> = [
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "database", label: "Database" },
    { key: "devops", label: "DevOps" },
    { key: "other", label: "Other" },
];

export default function TechStackPageClient({
    project,
    initialTechStack,
}: {
    project: any;
    initialTechStack: any;
}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const parseStack = (json: string | null): string[] => {
        try {
            const arr = json ? JSON.parse(json) : [];
            return Array.isArray(arr) ? arr.map((x) => (typeof x === "string" ? x : x.name).toString()) : [];
        } catch {
            return [];
        }
    };

    const [formData, setFormData] = useState<Record<string, string[]>>({
        frontend: parseStack(initialTechStack?.frontend),
        backend: parseStack(initialTechStack?.backend),
        database: parseStack(initialTechStack?.database),
        devops: parseStack(initialTechStack?.devops),
        other: parseStack(initialTechStack?.other),
    });
    const [newItem, setNewItem] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const { data: techStack = initialTechStack, refetch } = useQuery({
        queryKey: queryKeys.projects.techStack(project.id),
        queryFn: async () => {
            const res = await fetch(`/api/projects/${project.id}/tech-stack`);
            if (!res.ok) throw new Error("Failed to fetch tech stack");
            return res.json();
        },
        initialData: initialTechStack,
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => (techStack?.id ? updateTechStack(techStack.id, data) : Promise.resolve({ error: "No tech stack" })),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Tech stack updated");
                setIsEditing(false);
                await refetch();
            } else {
                toast.error(result.error || "Failed to update");
            }
        },
        onError: () => toast.error("Failed to update tech stack"),
    });

    const deleteMutation = useMutation({
        mutationFn: () => (techStack?.id ? deleteTechStack(techStack.id) : Promise.resolve({ error: "No tech stack" })),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Tech stack deleted");
                await refetch();
            } else {
                toast.error(result.error || "Failed to delete");
            }
        },
        onError: () => toast.error("Failed to delete tech stack"),
    });

    const aiGenerateMutation = useMutation({
        mutationFn: () => generateTechStack(project.id),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Tech stack generated");
                await refetch();
            } else {
                toast.error(result.error || "Failed to generate");
            }
        },
        onError: () => toast.error("Failed to generate tech stack"),
    });

    const handleSave = async () => {
        await updateMutation.mutateAsync(formData);
    };

    const addItem = (category: string) => {
        if (newItem.trim()) {
            setFormData({ ...formData, [category]: [...formData[category], newItem.trim()] });
            setNewItem("");
            setActiveCategory(null);
        }
    };

    const removeItem = (category: string, index: number) => {
        const next = [...formData[category]];
        next.splice(index, 1);
        setFormData({ ...formData, [category]: next });
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const confirmDelete = async () => {
        await deleteMutation.mutateAsync();
        setIsDeleteModalOpen(false);
    };

    const renderCategory = (label: string, key: string) => {
        const items = isEditing ? formData[key] : parseStack(techStack?.[key]);
        if (!isEditing && items.length === 0) return null;
        return (
            <div key={key} className="border-2 border-black bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center border-2 border-black">
                            <Code2 className="h-5 w-5 text-[#FF4D00]" />
                        </div>
                        <h3 className="font-semibold text-black">{label}</h3>
                    </div>
                    {isEditing && items.length > 0 && (
                        <button type="button" onClick={() => setActiveCategory(activeCategory === key ? null : key)} className="border-2 border-black px-2 py-1 font-mono text-[11px] uppercase tracking-tight text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]">
                            Add
                        </button>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {items.map((tech: any, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-2 border-2 border-black bg-black/5 px-3 py-1 text-sm text-black">
                                {tech}
                                {isEditing && (
                                    <button type="button" onClick={() => removeItem(key, idx)} aria-label={`Remove ${tech}`} className="text-black transition-colors hover:text-[#FF4D00]">
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                )}

                {isEditing && activeCategory === key && (
                    <div className="mt-3 flex gap-2">
                        <input
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") addItem(key); }}
                            placeholder="Add technology…"
                            className="h-10 flex-1 border-2 border-black bg-white px-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                        />
                        <button type="button" onClick={() => addItem(key)} className="nebula-btn nebula-btn--primary px-4 justify-center">Add</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="border-b-2 border-black bg-white px-4 lg:px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h1 className="type-h3">Tech Stack</h1>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                        {!techStack ? (
                            <button
                                type="button"
                                onClick={() => aiGenerateMutation.mutate()}
                                disabled={aiGenerateMutation.isPending}
                                className="nebula-btn nebula-btn--primary justify-center disabled:opacity-60"
                            >
                                {aiGenerateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                <span className="hidden sm:inline">{aiGenerateMutation.isPending ? "Generating…" : "Generate with AI"}</span>
                                <span className="sm:hidden">Generate</span>
                            </button>
                        ) : isEditing ? (
                            <>
                                <button type="button" onClick={handleSave} className="nebula-btn nebula-btn--primary justify-center">
                                    <Save className="h-4 w-4" /> Save
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="nebula-btn nebula-btn--ghost justify-center">
                                    <X className="h-4 w-4" /> Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => setIsEditing(true)} className="nebula-btn nebula-btn--primary justify-center">
                                    <Pencil className="h-4 w-4" /> Edit
                                </button>
                                <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-mono text-xs uppercase tracking-tight text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]">
                                    <Trash2 className="h-4 w-4" /> Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                    {!techStack && !aiGenerateMutation.isPending ? (
                        <div className="flex items-center justify-center px-4 py-16">
                            <div className="text-center">
                                <div className="mx-auto grid h-16 w-16 place-items-center border-2 border-black">
                                    <Code2 className="h-8 w-8 text-[#FF4D00]" />
                                </div>
                                <h3 className="type-h3 mb-2">No tech stack defined</h3>
                                <p className="text-black/60">Generate your tech stack with AI using the button above.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {CATEGORIES.map((c) => renderCategory(c.label, c.key))}
                        </div>
                    )}
                </div>
            </div>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Tech Stack"
                description="Are you sure you want to delete the tech stack? This action cannot be undone."
                confirmText="Delete Tech Stack"
            />
        </div>
    );
}
