"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, User, Target, Frown, Trash2, Pencil, Wand2 } from "lucide-react";
import { deletePersona, deleteAllPersonas } from "@/actions/crud";
import ProjectLayout from "@/components/projects/ProjectLayout";
import { queryKeys } from "@/lib/query-client";
import { DeleteModal } from "@/components/ui/DeleteModal";

const toArray = (val: any): string[] => {
    if (typeof val === "string") {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed.map(String);
        } catch {
            // ignore
        }
        return val.trim() ? val.split("\n").map((s: string) => s.trim()).filter(Boolean) : [];
    }
    return Array.isArray(val) ? val.map(String) : [];
};

export default function PersonasPage({ params, initialPersonas, projectName }: { params: { id: string }; initialPersonas: any[]; projectName: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: personas = initialPersonas } = useQuery({
        queryKey: queryKeys.projects.personas(params.id),
        queryFn: async () => initialPersonas,
        initialData: initialPersonas,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePersona(id),
        onSuccess: () => {
            toast.success("Persona deleted");
            router.refresh();
        },
        onError: () => toast.error("Failed to delete persona"),
    });

    const deleteAllMutation = useMutation({
        mutationFn: (projectId: string) => deleteAllPersonas(projectId),
        onSuccess: () => {
            toast.success("All personas deleted");
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.personas(params.id) });
            router.refresh();
        },
        onError: () => toast.error("Failed to delete all personas"),
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [personaToDelete, setPersonaToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setPersonaToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (personaToDelete === "ALL") {
            await deleteAllMutation.mutateAsync(params.id);
            setDeleteModalOpen(false);
            setPersonaToDelete(null);
        } else if (personaToDelete) {
            await deleteMutation.mutateAsync(personaToDelete);
            setDeleteModalOpen(false);
            setPersonaToDelete(null);
        }
    };

    const handleEdit = (persona: any) => {
        router.push(`/projects/${params.id}/personas/new?edit=${persona.id}`);
    };

    const handleGenerateClick = () => {
        router.push(`/projects/${params.id}/personas/generate`);
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col bg-white">
                <div className="border-b-2 border-black bg-white px-4 lg:px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <h1 className="type-h3">User Personas</h1>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                            <Link href={`/projects/${params.id}/personas/new`} className="nebula-btn nebula-btn--primary justify-center">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add persona</span>
                                <span className="sm:hidden">Add</span>
                            </Link>
                            <Link href={`/projects/${params.id}/personas/board`} className="nebula-btn nebula-btn--ghost justify-center">
                                Overview
                            </Link>
                            <Link href={`/projects/${params.id}/personas/connections`} className="nebula-btn nebula-btn--ghost justify-center">
                                Connections
                            </Link>
                            <Button
                                variant="nebula-ghost"
                                onClick={handleGenerateClick}
                                className="transition-all duration-300 text-sm px-4 py-2"
                            >
                                <Wand2 className="h-4 w-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                                <span className="hidden sm:inline">Generate with AI</span>
                                <span className="sm:hidden">AI Generate</span>
                            </Button>
                            {personas.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete("ALL")}
                                    className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-mono text-xs uppercase tracking-tight text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Delete all</span>
                                    <span className="sm:hidden">Clear</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    {personas.length === 0 ? (
                        <div className="flex items-center justify-center px-4 py-16">
                            <div className="max-w-md text-center">
                                <div className="mx-auto grid h-20 w-20 place-items-center border-2 border-black">
                                    <User className="h-10 w-10 text-[#FF4D00]" />
                                </div>
                                <h3 className="type-h3 mt-6">No personas yet</h3>
                                <p className="mt-3 text-black/60">
                                    Generate personas with AI or add them manually using the buttons above.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {personas.map((persona: any) => {
                                const goals = toArray(persona.goals);
                                const frustrations = toArray(persona.frustrations);
                                return (
                                    <div key={persona.id} className="border-2 border-black bg-white p-5 flex flex-col">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="grid h-12 w-12 shrink-0 place-items-center border-2 border-black text-lg font-bold text-black">
                                                    {(persona.name || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-black">{persona.name}</h3>
                                                    <p className="font-mono text-[11px] uppercase tracking-tight text-[#FF4D00]">{persona.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <button
                                                    onClick={() => handleEdit(persona)}
                                                    aria-label="Edit persona"
                                                    className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(persona.id)}
                                                    aria-label="Delete persona"
                                                    className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {persona.bio && (
                                            <p className="mt-4 text-sm text-[color:var(--color-charcoal)] line-clamp-3">{persona.bio}</p>
                                        )}

                                        <div className="mt-4 space-y-4 flex-1">
                                            {goals.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-tight text-black/50">
                                                        <Target className="h-3.5 w-3.5" /> Goals
                                                    </h4>
                                                    <ul className="mt-2 space-y-1 text-sm text-black/70">
                                                        {goals.map((g: string, i: number) => (
                                                            <li key={i} className="flex gap-2"><span className="text-[#FF4D00]">—</span> {g}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {frustrations.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-tight text-black/50">
                                                        <Frown className="h-3.5 w-3.5" /> Frustrations
                                                    </h4>
                                                    <ul className="mt-2 space-y-1 text-sm text-black/70">
                                                        {frustrations.map((f: string, i: number) => (
                                                            <li key={i} className="flex gap-2"><span className="text-[#FF4D00]">—</span> {f}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DeleteModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={personaToDelete === "ALL" ? "Delete All Personas" : "Delete Persona"}
                    description={
                        personaToDelete === "ALL"
                            ? "Are you sure you want to delete ALL personas? This action cannot be undone."
                            : "Are you sure you want to delete this persona? This action cannot be undone."
                    }
                    confirmText={personaToDelete === "ALL" ? "Delete All" : "Delete Persona"}
                />
            </div>
        </ProjectLayout>
    );
}
