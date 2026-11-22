"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Wand2, FileText, Loader2, Search, X, Filter } from "lucide-react";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { generateRequirements } from "@/actions/project";
import { deleteRequirement, deleteAllRequirements } from "@/actions/crud";
import { AIGenerationModal } from "./AIGenerationModal";
import { CategoryFilterSelect } from "@/components/ui/CategoryFilterSelect";
import { queryKeys, invalidateModule } from "@/lib/query-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NebulaButton } from "@/components/ui/NebulaButton";

export default function RequirementsPageClient({
    project,
    initialRequirements,
}: {
    project: any;
    initialRequirements: any[];
}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [requirementToDelete, setRequirementToDelete] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Use React Query for server state
    const { data: requirements = initialRequirements, isLoading } = useQuery({
        queryKey: queryKeys.projects.requirements(project.id),
        queryFn: async () => {
            // Fetch fresh data - in a real app you'd have an API endpoint
            // For now, we rely on initial data and mutations
            return initialRequirements;
        },
        initialData: initialRequirements,
    });

    // Sync server-fetched data to query cache when it changes (e.g., after router.refresh())
    useEffect(() => {
        queryClient.setQueryData(queryKeys.projects.requirements(project.id), initialRequirements);
    }, [initialRequirements, project.id, queryClient]);

    const [showFilter, setShowFilter] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const categoryOf = (r: any) => {
        const c: string = typeof r.content === "string" ? r.content : "";
        const m = c.match(/^Category:\s*(.+)$/m);
        return m ? m[1].trim() : null;
    };

    const categories = Array.from(
        new Set(requirements.map((r: any) => categoryOf(r)).filter(Boolean) as string[]),
    );

    const lower = search.trim().toLowerCase();
    const filtered = requirements.filter((r: any) => {
        const matchesSearch =
            !lower ||
            (r.title || "").toLowerCase().includes(lower) ||
            (typeof r.content === "string" && r.content.toLowerCase().includes(lower));
        const matchesCategory = !activeCategory || categoryOf(r) === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteRequirement(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.projects.requirements(project.id) });
            const previousRequirements = queryClient.getQueryData<any[]>(queryKeys.projects.requirements(project.id)) || [];
            
            queryClient.setQueryData(
                queryKeys.projects.requirements(project.id),
                (old: any[] = []) => old.filter((req) => req.id !== id)
            );
            
            return { previousRequirements };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(queryKeys.projects.requirements(project.id), context?.previousRequirements);
            toast.error("Failed to delete requirement");
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Requirement deleted");
            } else {
                toast.error(result.error || "Failed to delete requirement");
            }
            invalidateModule(project.id, "requirements");
        },
    });

    // Delete All mutation
    const deleteAllMutation = useMutation({
        mutationFn: () => deleteAllRequirements(project.id),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: queryKeys.projects.requirements(project.id) });
            const previousRequirements = queryClient.getQueryData<any[]>(queryKeys.projects.requirements(project.id)) || [];
            queryClient.setQueryData(queryKeys.projects.requirements(project.id), []);
            return { previousRequirements };
        },
        onError: (err, _, context) => {
            queryClient.setQueryData(queryKeys.projects.requirements(project.id), context?.previousRequirements);
            toast.error("Failed to delete all requirements");
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success("All requirements deleted");
            } else {
                toast.error(result.error || "Failed to delete requirements");
            }
            invalidateModule(project.id, "requirements");
        },
    });

    // AI Generation mutation
    const aiGenerateMutation = useMutation({
        mutationFn: (answers: Array<{ question: string; selected: string[] }>) =>
            generateRequirements(project.id, answers),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success(`Generated ${result.count} requirements`);
                // Invalidate cache and refresh server component
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.projects.requirements(project.id),
                });
                // Force Next.js to re-fetch server data
                router.refresh();
            } else {
                toast.error(result.error || "Failed to generate requirements");
            }
        },
        onError: () => {
            toast.error("Failed to generate requirements");
        },
    });

    const handleGenerateClick = () => {
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        await aiGenerateMutation.mutateAsync(answers);
    };

    const handleEdit = (req: any) => {
        router.push(`/projects/${project.id}/requirements/new?edit=${req.id}`);
    };

    const handleDelete = (id: string) => {
        setRequirementToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteAll = () => {
        setRequirementToDelete("ALL");
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (requirementToDelete === "ALL") {
            await deleteAllMutation.mutateAsync();
        } else if (requirementToDelete) {
            await deleteMutation.mutateAsync(requirementToDelete);
        }
        setDeleteModalOpen(false);
        setRequirementToDelete(null);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="nebula-hairline-b px-4 lg:px-6 py-4 bg-[var(--color-nebula-bg)]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search requirements"
                                className="h-11 w-full border-2 border-black bg-white pl-10 pr-10 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[color:var(--color-accent-orange)]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-black transition-colors hover:text-[color:var(--color-accent-orange)]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFilter((v) => !v);
                                        setActiveCategory(null);
                                    }}
                                    className={`inline-flex items-center gap-2 border-2 px-4 py-2 font-mono text-xs uppercase tracking-tight transition-colors ${
                                        showFilter
                                            ? "border-black bg-black text-white"
                                            : "border-black bg-white text-black hover:border-[color:var(--color-accent-orange)] hover:text-[color:var(--color-accent-orange)]"
                                    }`}
                                >
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </button>
                                <NebulaButton href={`/projects/${project.id}/requirements/board`} variant="ghost">
                                    Overview
                                </NebulaButton>
                                <NebulaButton href={`/projects/${project.id}/requirements/connections`} variant="ghost">
                                    Connections
                                </NebulaButton>
                                <NebulaButton href={`/projects/${project.id}/requirements/new`}>
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Add requirement</span>
                                    <span className="sm:hidden">Add</span>
                                </NebulaButton>
                                <NebulaButton variant="ghost" onClick={() => router.push(`/projects/${project.id}/refine`)}>
                                    <Wand2 className="h-4 w-4" />
                                    Plan more
                                </NebulaButton>
                                {requirements.length > 0 && (
                                    <NebulaButton variant="outline" onClick={handleDeleteAll}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Delete all</span>
                                        <span className="sm:hidden">Clear</span>
                                    </NebulaButton>
                                )}
                            </div>
                    </div>
                </div>
            </div>

            {/* Category filter (toggleable, searchable select) */}
            {showFilter && (
                <div className="border-b-2 border-black bg-white px-4 py-3 lg:px-6">
                    <div className="max-w-7xl mx-auto flex items-center gap-3">
                        <span className="font-mono text-xs uppercase tracking-tight text-black/50">Filter by</span>
                        <CategoryFilterSelect
                            categories={categories}
                            value={activeCategory}
                            onChange={setActiveCategory}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {/* Content List */}
                {requirements.length === 0 ? (
                    <div className="flex items-center justify-center px-4 py-16">
                        <div className="max-w-md text-center">
                            <div className="mx-auto grid h-20 w-20 place-items-center border-2 border-black">
                                <FileText className="h-10 w-10 text-[color:var(--color-accent-orange)]" />
                            </div>
                            <h3 className="type-h3 mt-6">No requirements yet</h3>
                            <p className="mt-3 text-black/60">
                                Start by generating requirements with AI, or add them manually using the
                                buttons above.
                            </p>
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                        <p className="text-sm text-black/60">No requirements match your search.</p>
                    </div>
                ) : (
                    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-3">
                        {filtered.map((req: any) => (
                            <div key={req.id} className="border-2 border-black bg-white p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2">
                                            <h3 className="text-base font-semibold text-[color:var(--color-nebula-fg)] mb-2">{req.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 border-2 border-black px-2 py-0.5 font-mono text-[11px] uppercase tracking-tight text-black/70">
                                                    {req.type === "functional" && (
                                                        <span className="h-2 w-2 bg-[color:var(--color-accent-orange)]" />
                                                    )}
                                                    {req.type === "functional" ? "Functional" : "Non-functional"}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 border-2 border-black px-2 py-0.5 font-mono text-[11px] uppercase tracking-tight ${
                                                        req.priority === "must-have"
                                                            ? "bg-black text-white"
                                                            : "text-black/70"
                                                    }`}
                                                >
                                                    {req.priority === "should-have" && (
                                                        <span className="h-2 w-2 bg-[color:var(--color-accent-orange)]" />
                                                    )}
                                                    {req.priority === "must-have" ? "Must have" : req.priority === "should-have" ? "Should have" : "Nice to have"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-[color:var(--color-charcoal)]">
                                            {(() => {
                                                try {
                                                    const content = req.content;
                                                    if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
                                                        const parsed = JSON.parse(content);
                                                        if (Array.isArray(parsed)) {
                                                            return (
                                                                <ul className="list-disc pl-4 space-y-1">
                                                                    {parsed.map((item: any, i: number) => (
                                                                        <li key={i}>{typeof item === 'object' ? (item.title || item.content || JSON.stringify(item)) : item}</li>
                                                                    ))}
                                                                </ul>
                                                            );
                                                        }
                                                        if (typeof parsed === 'object') {
                                                            return (
                                                                <div className="space-y-1">
                                                                    {Object.entries(parsed).map(([key, value]) => (
                                                                        <div key={key}><span className="font-semibold capitalize">{key}:</span> {String(value)}</div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                    return content;
                                                } catch {
                                                    return req.content;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() => handleEdit(req)}
                                            aria-label="Edit requirement"
                                            className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[color:var(--color-accent-orange)] hover:text-[color:var(--color-accent-orange)]"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(req.id)}
                                            aria-label="Delete requirement"
                                            className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[color:var(--color-accent-orange)] hover:text-[color:var(--color-accent-orange)]"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => {
                    setIsAIModalOpen(false);
                    // Reset mutation state when closing
                    aiGenerateMutation.reset();
                }}
                projectId={project.id}
                type="requirements"
                onGenerate={handleAIGenerate}
                isGenerating={aiGenerateMutation.isPending}
            />

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={requirementToDelete === "ALL" ? "Delete All Requirements" : "Delete Requirement"}
                description={
                    requirementToDelete === "ALL"
                        ? "Are you sure you want to delete all requirements? This action cannot be undone. Any artifacts linked to these requirements will also be deleted."
                        : "Are you sure you want to delete this requirement? This action cannot be undone. Any artifacts linked to this requirement will also be deleted."
                }
                confirmText={requirementToDelete === "ALL" ? "Delete All" : "Delete Requirement"}
            />
        </div >
    );
}
