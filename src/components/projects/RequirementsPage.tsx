"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, Wand2, Sparkles, FileText, Loader2 } from "lucide-react";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { generateRequirements } from "@/actions/project";
import { createRequirement, updateRequirement, deleteRequirement } from "@/actions/crud";
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

    const confirmDelete = async () => {
        if (requirementToDelete) {
            await deleteMutation.mutateAsync(requirementToDelete);
            setDeleteModalOpen(false);
            setRequirementToDelete(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 px-4 lg:px-6 py-4 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="text-center lg:text-left">
                            <h1 className="text-xl lg:text-2xl font-semibold text-white">Requirements</h1>
                        </div>
                        {!isAdding && !editingId && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                <Button
                                    onClick={() => setIsAdding(true)}
                                    className="bg-white text-black hover:bg-gray-200 text-sm px-4 py-2"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Add Requirement</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                                <Button
                                    variant="glass"
                                    onClick={handleGenerateClick}
                                    disabled={aiGenerateMutation.isPending}
                                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 hover:border-indigo-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] text-sm px-4 py-2"
                                >
                                    {aiGenerateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-4 h-4 mr-2 text-indigo-400 group-hover:rotate-12 transition-transform" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}
                                    </span>
                                    <span className="sm:hidden">
                                        {aiGenerateMutation.isPending ? "Generating..." : "AI Generate"}
                                    </span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {/* Add/Edit Form */}
                {(isAdding || editingId) && (
                    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                        <GlassCard className="p-4 lg:p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {editingId ? "Edit Requirement" : "New Requirement"}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-300">Title</label>
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
                                        <label className="text-sm font-medium text-gray-300">Description</label>
                                        <ImproveButton
                                            currentText={formData.content}
                                            fieldType="requirement description"
                                            onImprove={(improved) => setFormData({ ...formData, content: improved })}
                                        />
                                    </div>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        rows={4}
                                        placeholder="Describe the requirement in detail..."
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 mb-2 block">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                                        >
                                            <option value="functional">Functional</option>
                                            <option value="non-functional">Non-Functional</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 mb-2 block">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                                        >
                                            <option value="must-have">Must Have</option>
                                            <option value="should-have">Should Have</option>
                                            <option value="nice-to-have">Nice to Have</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" className="bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-all">
                                        {editingId ? "Update Requirement" : "Create Requirement"}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setEditingId(null);
                                            setFormData({ title: "", content: "", type: "functional", priority: "must-have" });
                                        }}
                                        variant="ghost"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                )}

                {/* Requirements List */}
                {requirements.length === 0 && !isAdding ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center max-w-md mx-auto px-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                                <FileText className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No Requirements Yet</h3>
                            <p className="text-gray-400 mb-6">Start by generating requirements with AI or add them manually</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={handleGenerateClick}
                                    disabled={aiGenerateMutation.isPending}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                                >
                                    {aiGenerateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 mr-2" />
                                    )}
                                    Generate with AI
                                </Button>
                                <Button
                                    onClick={() => setIsAdding(true)}
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Manually
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : !isAdding && !editingId && (
                    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-3">
                        {requirements.map((req: any) => (
                            <GlassCard key={req.id} className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2">
                                            <h3 className="text-base font-semibold text-white mb-2">{req.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${req.type === "functional"
                                                        ? "bg-blue-500/20 text-blue-300"
                                                        : "bg-purple-500/20 text-purple-300"
                                                        }`}
                                                >
                                                    {req.type === "functional" ? "Functional" : "Non-Functional"}
                                                </span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${req.priority === "must-have"
                                                        ? "bg-red-500/20 text-red-300"
                                                        : req.priority === "should-have"
                                                            ? "bg-yellow-500/20 text-yellow-300"
                                                            : "bg-green-500/20 text-green-300"
                                                        }`}
                                                >
                                                    {req.priority === "must-have" ? "Must Have" : req.priority === "should-have" ? "Should Have" : "Nice to Have"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-300">
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
                                            className="p-2 hover:bg-white/10 rounded transition-colors"
                                        >
                                            <Pencil className="w-4 h-4 text-gray-400 hover:text-white" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(req.id)}
                                            className="p-2 hover:bg-white/10 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
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
                title="Delete Requirement"
                description="Are you sure you want to delete this requirement? This action cannot be undone and will permanently remove the requirement from your project."
                confirmText="Delete Requirement"
            />
        </div >
    );
}
