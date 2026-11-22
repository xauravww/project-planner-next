"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, Wand2, FileText, Loader2, Search, X } from "lucide-react";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { generateRequirements } from "@/actions/project";
import { createRequirement, updateRequirement, deleteRequirement, deleteAllRequirements } from "@/actions/crud";
import { AIGenerationModal } from "./AIGenerationModal";
import { ImproveButton } from "@/components/ui/ImproveButton";
import { queryKeys, invalidateModule } from "@/lib/query-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RequirementsPageClient({
    project,
    initialRequirements,
}: {
    project: any;
    initialRequirements: any[];
}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "functional",
        priority: "must-have",
    });

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

    const lower = search.trim().toLowerCase();
    const filtered = lower
        ? requirements.filter(
              (r: any) =>
                  (r.title || "").toLowerCase().includes(lower) ||
                  (typeof r.content === "string" && r.content.toLowerCase().includes(lower)),
          )
        : requirements;

    // Create mutation with optimistic update
    const createMutation = useMutation({
        mutationFn: (vars: { projectId: string; data: any }) => 
            createRequirement(vars.projectId, vars.data),
        onMutate: async (vars) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.projects.requirements(project.id) });
            const previousRequirements = queryClient.getQueryData<any[]>(queryKeys.projects.requirements(project.id)) || [];
            
            // Optimistically add to UI
            const optimisticRequirement = {
                id: `temp-${Date.now()}`,
                ...vars.data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            
            queryClient.setQueryData(
                queryKeys.projects.requirements(project.id),
                (old: any[] = []) => [...old, optimisticRequirement]
            );
            
            return { previousRequirements };
        },
        onError: (err, vars, context) => {
            queryClient.setQueryData(queryKeys.projects.requirements(project.id), context?.previousRequirements);
            toast.error("Failed to create requirement");
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Requirement created successfully");
            } else {
                toast.error(result.error || "Failed to create requirement");
            }
            invalidateModule(project.id, "requirements");
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: any }) => updateRequirement(vars.id, vars.data),
        onMutate: async (vars) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.projects.requirements(project.id) });
            const previousRequirements = queryClient.getQueryData<any[]>(queryKeys.projects.requirements(project.id)) || [];
            
            queryClient.setQueryData(
                queryKeys.projects.requirements(project.id),
                (old: any[] = []) => old.map((req) => (req.id === vars.id ? { ...req, ...vars.data } : req))
            );
            
            return { previousRequirements };
        },
        onError: (err, vars, context) => {
            queryClient.setQueryData(queryKeys.projects.requirements(project.id), context?.previousRequirements);
            toast.error("Failed to update requirement");
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Requirement updated");
            } else {
                toast.error(result.error || "Failed to update requirement");
            }
            invalidateModule(project.id, "requirements");
        },
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            await updateMutation.mutateAsync({ id: editingId, data: formData });
            setEditingId(null);
        } else {
            await createMutation.mutateAsync({ projectId: project.id, data: formData });
            setIsAdding(false);
        }

        setFormData({ title: "", content: "", type: "functional", priority: "must-have" });
    };

    const handleEdit = (req: any) => {
        setEditingId(req.id);
        setFormData({
            title: req.title,
            content: req.content,
            type: req.type,
            priority: req.priority,
        });
        setIsAdding(false);
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
                                className="h-11 w-full border-2 border-black bg-white pl-10 pr-10 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-black transition-colors hover:text-[#FF4D00]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        {!isAdding && !editingId && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                <Link href={`/projects/${project.id}/requirements/new`} className="nebula-btn nebula-btn--primary justify-center">
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Add requirement</span>
                                    <span className="sm:hidden">Add</span>
                                </Link>
                                <Button
                                    variant="nebula-ghost"
                                    onClick={() => router.push(`/projects/${project.id}/refine`)}
                                    className="transition-colors"
                                >
                                    <Wand2 className="h-4 w-4" />
                                    Plan more
                                </Button>
                                {requirements.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteAll}
                                        className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-mono text-xs uppercase tracking-tight text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Delete all</span>
                                        <span className="sm:hidden">Clear</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {/* Add/Edit Modal */}
                <Dialog 
                    open={isAdding || editingId !== null} 
                    onOpenChange={(open) => {
                        if (!open) {
                            setIsAdding(false);
                            setEditingId(null);
                            setFormData({ title: "", content: "", type: "functional", priority: "must-have" });
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-[700px] border-2 border-black bg-white text-black rounded-none max-h-[90vh] overflow-hidden flex flex-col p-0">
                        <DialogHeader className="px-6 py-5 relative z-10 border-b border-[var(--color-nebula-hairline-strong)]">
                            <DialogTitle className="flex items-center gap-3 text-[color:var(--color-nebula-fg)] type-h3">
                                <div className="p-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-nebula-hairline-strong)]">
                                    {editingId ? <Pencil className="w-5 h-5 text-[color:var(--color-nebula-fg)]" /> : <FileText className="w-5 h-5 text-[color:var(--color-nebula-fg)]" />}
                                </div>
                                {editingId ? "Edit Requirement" : "New Requirement"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                            <form id="requirement-form" onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-[color:var(--color-charcoal)]">Title</label>
                                        <ImproveButton
                                            currentText={formData.title}
                                            fieldType="requirement title"
                                            onImprove={(improved) => setFormData({ ...formData, title: improved })}
                                        />
                                    </div>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., User Authentication System"
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-[color:var(--color-charcoal)]">Description</label>
                                        <ImproveButton
                                            currentText={formData.content}
                                            fieldType="requirement description"
                                            onImprove={(improved) => setFormData({ ...formData, content: improved })}
                                        />
                                    </div>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="flex min-h-[120px] w-full resize-y border-2 border-black bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                                        placeholder="Describe the requirement in detail…"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-[color:var(--color-charcoal)] mb-2 block">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full border-2 border-black bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-[#FF4D00]"
                                        >
                                            <option value="functional">Functional</option>
                                            <option value="non-functional">Non-Functional</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-[color:var(--color-charcoal)] mb-2 block">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full border-2 border-black bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-[#FF4D00]"
                                        >
                                            <option value="must-have">Must Have</option>
                                            <option value="should-have">Should Have</option>
                                            <option value="nice-to-have">Nice to Have</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <DialogFooter className="px-6 py-5 border-t border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-bg)]/50 flex flex-row justify-between sm:justify-end gap-3">
                            <Button
                                type="button"
                                variant="nebula-ghost"
                                className="px-6"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                    setFormData({ title: "", content: "", type: "functional", priority: "must-have" });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                form="requirement-form"
                                variant="nebula"
                                className="px-6"
                            >
                                {editingId ? "Update Requirement" : "Create Requirement"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Content List */}
                {requirements.length === 0 ? (
                    <div className="flex items-center justify-center px-4 py-16">
                        <div className="max-w-md text-center">
                            <div className="mx-auto grid h-20 w-20 place-items-center border-2 border-black">
                                <FileText className="h-10 w-10 text-[#FF4D00]" />
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
                                                <span
                                                    className={`border-2 border-black px-2 py-0.5 font-mono text-[11px] uppercase tracking-tight ${
                                                        req.type === "functional" ? "text-[#FF4D00]" : "text-black/70"
                                                    }`}
                                                >
                                                    {req.type === "functional" ? "Functional" : "Non-functional"}
                                                </span>
                                                <span
                                                    className={`border-2 border-black px-2 py-0.5 font-mono text-[11px] uppercase tracking-tight ${
                                                        req.priority === "must-have"
                                                            ? "bg-black text-white"
                                                            : req.priority === "should-have"
                                                                ? "text-[#FF4D00]"
                                                                : "text-black/70"
                                                    }`}
                                                >
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
                                            className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(req.id)}
                                            aria-label="Delete requirement"
                                            className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
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
