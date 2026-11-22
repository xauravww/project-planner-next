"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Route, Trash2, Pencil, Wand2 } from "lucide-react";
import { deleteUserJourney, deleteAllUserJourneys } from "@/actions/crud";
import ProjectLayout from "@/components/projects/ProjectLayout";
import { queryKeys } from "@/lib/query-client";
import { DeleteModal } from "@/components/ui/DeleteModal";

const cleanStep = (s: string): string =>
    String(s)
        .replace(/^\d+[.)]\s*/, "")
        .replace(/[*_`]/g, "")
        .replace(/\s+/g, " ")
        .trim();

const stepsOf = (j: any): string[] => {
    let arr: string[] = [];
    if (typeof j.steps === "string") {
        try {
            const parsed = JSON.parse(j.steps);
            if (Array.isArray(parsed)) arr = parsed.map(String);
        } catch {
            // ignore
        }
        if (arr.length === 0) arr = j.steps.split("\n").map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(j.steps)) {
        arr = j.steps.map(String);
    }
    return arr.map(cleanStep).filter(Boolean);
};

export default function UserJourneysPage({ params, initialJourneys, projectName }: { params: { id: string }; initialJourneys: any[]; projectName: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: journeys = initialJourneys } = useQuery({
        queryKey: queryKeys.projects.journeys(params.id),
        queryFn: async () => initialJourneys,
        initialData: initialJourneys,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUserJourney(id),
        onSuccess: () => {
            toast.success("Journey deleted");
            router.refresh();
        },
        onError: () => toast.error("Failed to delete journey"),
    });

    const deleteAllMutation = useMutation({
        mutationFn: (projectId: string) => deleteAllUserJourneys(projectId),
        onSuccess: () => {
            toast.success("All journeys deleted");
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.journeys(params.id) });
            router.refresh();
        },
        onError: () => toast.error("Failed to delete all journeys"),
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [journeyToDelete, setJourneyToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setJourneyToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (journeyToDelete === "ALL") {
            await deleteAllMutation.mutateAsync(params.id);
            setDeleteModalOpen(false);
            setJourneyToDelete(null);
        } else if (journeyToDelete) {
            await deleteMutation.mutateAsync(journeyToDelete);
            setDeleteModalOpen(false);
            setJourneyToDelete(null);
        }
    };

    const handleEdit = (journey: any) => {
        router.push(`/projects/${params.id}/journeys/new?edit=${journey.id}`);
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col bg-white">
                <div className="border-b-2 border-black bg-white px-4 lg:px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <h1 className="type-h3">User Journeys</h1>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                            <Link href={`/projects/${params.id}/journeys/new`} className="nebula-btn nebula-btn--primary justify-center">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add journey</span>
                                <span className="sm:hidden">Add</span>
                            </Link>
                            <Link href={`/projects/${params.id}/journeys/board`} className="nebula-btn nebula-btn--ghost justify-center">
                                Overview
                            </Link>
                            <Link href={`/projects/${params.id}/journeys/connections`} className="nebula-btn nebula-btn--ghost justify-center">
                                Connections
                            </Link>
                            <Button variant="nebula-ghost" onClick={() => router.push(`/projects/${params.id}/journeys/generate`)} className="transition-all duration-300 text-sm px-4 py-2">
                                <Wand2 className="h-4 w-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                                <span className="hidden sm:inline">Generate with AI</span>
                                <span className="sm:hidden">AI Generate</span>
                            </Button>
                            {journeys.length > 0 && (
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
                    {journeys.length === 0 ? (
                        <div className="flex items-center justify-center px-4 py-16">
                            <div className="max-w-md text-center">
                                <div className="mx-auto grid h-20 w-20 place-items-center border-2 border-black">
                                    <Route className="h-10 w-10 text-[#FF4D00]" />
                                </div>
                                <h3 className="type-h3 mt-6">No journeys yet</h3>
                                <p className="mt-3 text-black/60">
                                    Generate journeys with AI or add them manually using the buttons above.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-3">
                            {journeys.map((journey: any) => {
                                const steps = stepsOf(journey);
                                return (
                                    <div key={journey.id} className="border-2 border-black bg-white p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-black">{journey.title}</h3>
                                                {steps.length > 0 && (
                                                    <ol className="mt-3 space-y-2">
                                                        {steps.map((s, i) => (
                                                            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-black/75">
                                                                <span className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold text-[#FF4D00]">{i + 1}.</span>
                                                                <span className="min-w-0 break-words">{s}</span>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                )}
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <button onClick={() => handleEdit(journey)} aria-label="Edit journey" className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(journey.id)} aria-label="Delete journey" className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
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
                    title={journeyToDelete === "ALL" ? "Delete All Journeys" : "Delete Journey"}
                    description={journeyToDelete === "ALL" ? "Are you sure you want to delete ALL journeys? This action cannot be undone." : "Are you sure you want to delete this journey? This action cannot be undone."}
                    confirmText={journeyToDelete === "ALL" ? "Delete All" : "Delete Journey"}
                />
            </div>
        </ProjectLayout>
    );
}
