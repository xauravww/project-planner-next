"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, Wand2, Sparkles, FileText, Loader2 } from "lucide-react";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { generateRequirements } from "@/actions/project";
import { createRequirement, updateRequirement, deleteRequirement, deleteAllRequirements } from "@/actions/crud";
import { AIGenerationModal } from "./AIGenerationModal";
import { ImproveButton } from "@/components/ui/ImproveButton";
import { queryKeys, invalidateModule } from "@/lib/query-client";
import { useRouter } from "next/navigation";

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
                        <div className="text-center lg:text-left">
                            <h1 className="type-h3">Requirements</h1>
                        </div>
                        {!isAdding && !editingId && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                <Button
                                    onClick={() => {
                                        setIsAdding(true);
                                        setEditingId(null);
                                        setFormData({ title: "", content: "", type: "functional", priority: "must-have" });
                                    }}
                                    variant="nebula"
                                    className="transition-all duration-300"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Add Requirement</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                                <Button
                                    variant="nebula-ghost"
                                    onClick={handleGenerateClick}
                                    disabled={aiGenerateMutation.isPending}
                                    className="transition-all duration-300 text-sm px-4 py-2"
                                >
                                    {aiGenerateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-4 h-4 mr-2 text-[color:var(--color-nebula-fg)] group-hover:rotate-12 transition-transform" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}
                                    </span>
                                    <span className="sm:hidden">
                                        {aiGenerateMutation.isPending ? "Generating..." : "AI Generate"}
                                    </span>
                                </Button>
                                {requirements.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        onClick={handleDeleteAll}
                                        className="text-sm px-4 py-2 hover:bg-[var(--color-accent-red-glow)] hover:text-[color:var(--color-accent-red)] text-[color:var(--color-ash)] transition-colors border border-transparent hover:border-[var(--color-accent-red)]/20"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Delete All</span>
                                        <span className="sm:hidden">Clear</span>
                                    </Button>
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
                    <DialogContent className="sm:max-w-[700px] bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-2xl text-[color:var(--color-nebula-fg)] max-h-[90vh] overflow-hidden flex flex-col p-0">
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
                                        className="flex w-full rounded-[var(--r-md)] border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] px-4 py-3 text-sm text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] focus:outline-none focus:ring-1 focus:ring-[var(--color-nebula-fg)] resize-y min-h-[120px]"
                                        placeholder="Describe the requirement in detail..."
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-[color:var(--color-charcoal)] mb-2 block">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-4 py-3 text-sm text-[color:var(--color-nebula-fg)] focus:outline-none focus:ring-1 focus:ring-[var(--color-nebula-fg)]"
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
                                            className="w-full bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-4 py-3 text-sm text-[color:var(--color-nebula-fg)] focus:outline-none focus:ring-1 focus:ring-[var(--color-nebula-fg)]"
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
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center max-w-md mx-auto px-4">
                            <div className="w-20 h-20 bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] flex items-center justify-center mx-auto mb-6 border border-[var(--color-nebula-hairline-strong)]">
                                <FileText className="w-10 h-10 text-[color:var(--color-nebula-fg)]" />
                            </div>
                            <h3 className="type-h3 mb-3">No Requirements Yet</h3>
                            <p className="text-[color:var(--color-charcoal)] mb-6">Start by generating requirements with AI or add them manually</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    variant="nebula"
                                    onClick={handleGenerateClick}
                                    disabled={aiGenerateMutation.isPending}
                                >
                                    {aiGenerateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 mr-2" />
                                    )}
                                    Generate with AI
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsAdding(true);
                                        setEditingId(null);
                                        setFormData({ title: "", content: "", type: "functional", priority: "must-have" });
                                    }}
                                    variant="nebula-ghost"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Manually
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-3">
                        {requirements.map((req: any) => (
                            <GlassCard key={req.id} className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2">
                                            <h3 className="text-base font-semibold text-[color:var(--color-nebula-fg)] mb-2">{req.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${req.type === "functional"
                                                        ? "bg-[var(--color-surface-elevated)] text-[color:var(--color-accent-blue)]"
                                                        : "bg-[var(--color-surface-elevated)] text-[color:var(--color-nebula-fg-soft)]"
                                                        }`}
                                                >
                                                    {req.type === "functional" ? "Functional" : "Non-Functional"}
                                                </span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${req.priority === "must-have"
                                                        ? "bg-[var(--color-accent-red-glow)] text-[color:var(--color-accent-red)]"
                                                        : req.priority === "should-have"
                                                            ? "bg-[var(--color-surface-elevated)] text-[color:var(--color-accent-yellow)]"
                                                            : "bg-[var(--color-accent-green-glow)] text-[color:var(--color-accent-green)]"
                                                        }`}
                                                >
                                                    {req.priority === "must-have" ? "Must Have" : req.priority === "should-have" ? "Should Have" : "Nice to Have"}
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
                                    <div className="flex gap-1 ml-4">
                                        <button
                                            onClick={() => handleEdit(req)}
                                            className="p-2 hover:bg-[var(--color-surface-elevated)] rounded transition-colors"
                                        >
                                            <Pencil className="w-4 h-4 text-[color:var(--color-ash)] hover:text-[color:var(--color-nebula-fg)]" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(req.id)}
                                            className="p-2 hover:bg-[var(--color-surface-elevated)] rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-[color:var(--color-ash)] hover:text-[color:var(--color-accent-red)]" />
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
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
                        ? "Are you sure you want to delete ALL requirements? This action cannot be undone and will permanently remove everything from this list."
                        : "Are you sure you want to delete this requirement? This action cannot be undone and will permanently remove the requirement from your project."
                }
                confirmText={requirementToDelete === "ALL" ? "Delete All" : "Delete Requirement"}
            />
        </div >
    );
}
