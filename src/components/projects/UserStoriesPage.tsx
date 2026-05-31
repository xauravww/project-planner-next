"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Plus, Pencil, Trash2, Target, Wand2, Sparkles, Loader2 } from "lucide-react";
import { generateUserStories } from "@/actions/project";
import { createUserStory, updateUserStory, deleteUserStory, deleteAllUserStories } from "@/actions/crud";
import { AIGenerationModal } from "./AIGenerationModal";
import { queryKeys } from "@/lib/query-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";

export default function UserStoriesPageClient({
    project,
    initialStories,
}: {
    project: any;
    initialStories: any[];
}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        acceptanceCriteria: "",
        priority: "must-have",
        storyPoints: 1,
    });

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const { data: stories = initialStories } = useQuery({
        queryKey: queryKeys.projects.userStories(project.id),
        queryFn: async () => initialStories,
        initialData: initialStories,
    });

    const createMutation = useMutation({
        mutationFn: (vars: { projectId: string; data: any }) => createUserStory(vars.projectId, vars.data),
        onMutate: async (vars) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.projects.userStories(project.id) });
            const previousStories = queryClient.getQueryData<any[]>(queryKeys.projects.userStories(project.id)) || [];
            const optimisticStory = {
                id: `temp-${Date.now()}`,
                ...vars.data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            queryClient.setQueryData(queryKeys.projects.userStories(project.id), (old: any[] = []) => [...old, optimisticStory]);
            return { previousStories };
        },
        onError: (err, vars, context) => {
            queryClient.setQueryData(queryKeys.projects.userStories(project.id), context?.previousStories);
            toast.error("Failed to create user story");
        },
        onSuccess: () => {
            toast.success("User story created");
            router.refresh();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: any }) => updateUserStory(vars.id, vars.data),
        onMutate: async (vars) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.projects.userStories(project.id) });
            const previousStories = queryClient.getQueryData<any[]>(queryKeys.projects.userStories(project.id)) || [];
            queryClient.setQueryData(queryKeys.projects.userStories(project.id), (old: any[] = []) => 
                old.map((s) => (s.id === vars.id ? { ...s, ...vars.data } : s)));
            return { previousStories };
        },
        onError: (err, vars, context) => {
            queryClient.setQueryData(queryKeys.projects.userStories(project.id), context?.previousStories);
            toast.error("Failed to update user story");
        },
        onSuccess: () => {
            toast.success("User story updated");
            router.refresh();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUserStory(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.projects.userStories(project.id) });
            const previousStories = queryClient.getQueryData<any[]>(queryKeys.projects.userStories(project.id)) || [];
            queryClient.setQueryData(queryKeys.projects.userStories(project.id), (old: any[] = []) => old.filter((s) => s.id !== id));
            return { previousStories };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(queryKeys.projects.userStories(project.id), context?.previousStories);
            toast.error("Failed to delete user story");
        },
        onSuccess: () => {
            toast.success("User story deleted");
            router.refresh();
        },
    });

    const deleteAllMutation = useMutation({
        mutationFn: (projectId: string) => deleteAllUserStories(projectId),
        onMutate: async (projectId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.projects.userStories(projectId) });
            const previousStories = queryClient.getQueryData<any[]>(queryKeys.projects.userStories(projectId)) || [];
            queryClient.setQueryData(queryKeys.projects.userStories(projectId), []);
            return { previousStories };
        },
        onError: (err, projectId, context) => {
            queryClient.setQueryData(queryKeys.projects.userStories(projectId), context?.previousStories);
            toast.error("Failed to delete all user stories");
        },
        onSuccess: () => {
            toast.success("All user stories deleted");
            router.refresh();
        },
    });

    const aiGenerateMutation = useMutation({
        mutationFn: (answers: Array<{ question: string; selected: string[] }>) => generateUserStories(project.id, answers),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success(`Generated ${result.count} user stories`);
                await queryClient.invalidateQueries({ queryKey: queryKeys.projects.userStories(project.id) });
                router.refresh();
            } else {
                toast.error(result.error || "Failed to generate user stories");
            }
        },
        onError: () => {
            toast.error("Failed to generate user stories");
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

        const data = {
            ...formData,
            storyPoints: Number(formData.storyPoints),
        };

        if (editingId) {
            await updateMutation.mutateAsync({ id: editingId, data });
            setEditingId(null);
        } else {
            await createMutation.mutateAsync({ projectId: project.id, data });
            setIsAdding(false);
        }

        setFormData({
            title: "",
            content: "",
            acceptanceCriteria: "",
            priority: "must-have",
            storyPoints: 1,
        });
    };

    const handleEdit = (story: any) => {
        setEditingId(story.id);
        setFormData({
            title: story.title,
            content: story.content,
            acceptanceCriteria: story.acceptanceCriteria || "",
            priority: story.priority,
            storyPoints: story.storyPoints || 1,
        });
        setIsAdding(false);
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [storyToDelete, setStoryToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setStoryToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (storyToDelete === "ALL") {
            await deleteAllMutation.mutateAsync(project.id);
            setDeleteModalOpen(false);
            setStoryToDelete(null);
        } else if (storyToDelete) {
            await deleteMutation.mutateAsync(storyToDelete);
            setDeleteModalOpen(false);
            setStoryToDelete(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="nebula-hairline-b px-4 lg:px-6 py-4 bg-[var(--color-nebula-bg)]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="text-center lg:text-left">
                            <h1 className="type-h3">User Stories</h1>
                        </div>
                        {!isAdding && !editingId && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                <Button
                                    variant="nebula"
                                    onClick={() => setIsAdding(true)}
                                    className="text-sm px-4 py-2"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Add Story</span>
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
                                        <Wand2 className="w-4 h-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                                    )}
                                    <span className="hidden sm:inline">{aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}</span>
                                    <span className="sm:hidden">{aiGenerateMutation.isPending ? "Generating..." : "AI Generate"}</span>
                                </Button>
                                {stories.length > 0 && (
                                    <Button
                                        variant="nebula-ghost"
                                        onClick={() => handleDelete("ALL")}
                                        className="text-sm px-4 py-2 hover:bg-[var(--color-accent-red-glow)] hover:text-[color:var(--color-accent-red)] hover:border-[var(--color-accent-red)] border border-transparent"
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

            {/* Content - scrollable */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                    {/* Add/Edit Form Modal */}
                    <Dialog 
                        open={isAdding || editingId !== null} 
                        onOpenChange={(open) => {
                            if (!open) {
                                setIsAdding(false);
                                setEditingId(null);
                                setFormData({
                                    title: "",
                                    content: "",
                                    acceptanceCriteria: "",
                                    priority: "must-have",
                                    storyPoints: 1,
                                });
                            }
                        }}
                    >
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader className="px-6 py-5 relative z-10 border-b border-[var(--color-nebula-hairline-strong)]">
                                <DialogTitle className="type-h4 text-[color:var(--color-nebula-fg)] text-center">
                                    {editingId ? "Edit User Story" : "New User Story"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                                <div>
                                    <label className="text-sm font-medium text-[color:var(--color-charcoal)] mb-2 block">Title</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="As a user, I want to..."
                                        className="bg-white/5 border-[var(--color-nebula-hairline-strong)] focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[color:var(--color-charcoal)] mb-2 block">Description</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-4 py-3 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[color:var(--color-charcoal)] mb-2 block">
                                        Acceptance Criteria
                                    </label>
                                    <textarea
                                        value={formData.acceptanceCriteria}
                                        onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-4 py-3 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                                        rows={4}
                                        placeholder="- User can see login button&#10;- User gets error on invalid input"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-[color:var(--color-charcoal)] mb-2 block">Priority</label>
                                        <div className="relative">
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-4 py-3 text-[color:var(--color-nebula-fg)] appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                                            >
                                                <option value="must-have" className="bg-[var(--color-nebula-surface)] text-[color:var(--color-nebula-fg)]">Must Have</option>
                                                <option value="should-have" className="bg-[var(--color-nebula-surface)] text-[color:var(--color-nebula-fg)]">Should Have</option>
                                                <option value="nice-to-have" className="bg-[var(--color-nebula-surface)] text-[color:var(--color-nebula-fg)]">Nice to Have</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--color-ash)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-[color:var(--color-charcoal)] mb-2 block">Story Points</label>
                                        <Input
                                            type="number"
                                            value={formData.storyPoints}
                                            onChange={(e) => setFormData({ ...formData, storyPoints: Number(e.target.value) })}
                                            min={1}
                                            max={13}
                                            className="bg-white/5 border-[var(--color-nebula-hairline-strong)] focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="px-6 py-5 border-t border-[var(--color-nebula-hairline-strong)]">
                                    <div className="flex gap-3 justify-end w-full">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setIsAdding(false);
                                                setEditingId(null);
                                                setFormData({
                                                    title: "",
                                                    content: "",
                                                    acceptanceCriteria: "",
                                                    priority: "must-have",
                                                    storyPoints: 1,
                                                });
                                            }}
                                            variant="nebula-ghost"
                                            className="px-6"
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="nebula" className="px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-0 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                                            {editingId ? "Update User Story" : "Create User Story"}
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Stories List */}
                    {stories.length === 0 ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center max-w-md mx-auto px-4">
                                <div className="w-20 h-20 bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] flex items-center justify-center mx-auto mb-6 border border-[var(--color-nebula-hairline-strong)]">
                                    <Target className="w-10 h-10 text-[color:var(--color-nebula-fg)]" />
                                </div>
                                <h3 className="type-h3 mb-3">No User Stories Yet</h3>
                                <p className="text-[color:var(--color-charcoal)] mb-6">Generate user stories with AI or add them manually</p>
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
                                        onClick={() => setIsAdding(true)}
                                        variant="nebula-ghost"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Manually
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : !isAdding && !editingId && (
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {stories.map((story: any) => (
                                <GlassCard key={story.id} className="p-5 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target className="w-4 h-4 text-[color:var(--color-accent-orange)]" />
                                                <h3 className="text-base font-semibold text-[color:var(--color-nebula-fg)]">{story.title}</h3>
                                            </div>
                                            <div className="text-sm text-[color:var(--color-charcoal)] italic mb-3">
                                                {(() => {
                                                    try {
                                                        const content = story.content;
                                                        if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
                                                            const parsed = JSON.parse(content);
                                                            return typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : content;
                                                        }
                                                        return content;
                                                    } catch {
                                                        return story.content;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 ml-4">
                                            <button
                                                onClick={() => handleEdit(story)}
                                                className="p-2 hover:bg-[var(--color-surface-elevated)] rounded transition-colors"
                                            >
                                                <Pencil className="w-4 h-4 text-[color:var(--color-ash)] hover:text-[color:var(--color-nebula-fg)]" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(story.id)}
                                                className="p-2 hover:bg-[var(--color-surface-elevated)] rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-[color:var(--color-ash)] hover:text-[color:var(--color-accent-red)]" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Acceptance Criteria */}
                                    {story.acceptanceCriteria && (
                                        <div className="mb-3">
                                            <h4 className="text-xs font-semibold text-[color:var(--color-ash)] mb-1">Acceptance Criteria:</h4>
                                            <div className="bg-[var(--color-nebula-surface)] rounded p-2 border border-[var(--color-nebula-hairline-strong)]">
                                                <pre className="text-xs text-[color:var(--color-charcoal)] whitespace-pre-wrap font-sans">
                                                    {story.acceptanceCriteria}
                                                </pre>
                                            </div>
                                        </div>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-2 mt-auto pt-3 nebula-hairline-t">
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${story.priority === "must-have"
                                                ? "bg-[var(--color-accent-red-glow)] text-[color:var(--color-accent-red)] border border-[var(--color-nebula-hairline-strong)]"
                                                : story.priority === "should-have"
                                                    ? "bg-[var(--color-surface-elevated)] text-[color:var(--color-accent-yellow)] border border-[var(--color-nebula-hairline-strong)]"
                                                    : "bg-[var(--color-accent-green-glow)] text-[color:var(--color-accent-green)] border border-[var(--color-nebula-hairline-strong)]"
                                                }`}
                                        >
                                            {story.priority}
                                        </span>
                                        {story.storyPoints && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] text-[color:var(--color-accent-blue)] border border-[var(--color-nebula-hairline-strong)]">
                                                {story.storyPoints} pts
                                            </span>
                                        )}
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
                        aiGenerateMutation.reset();
                    }}
                    projectId={project.id}
                    type="stories"
                    onGenerate={handleAIGenerate}
                    isGenerating={aiGenerateMutation.isPending}
                />
            </div>

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={storyToDelete === "ALL" ? "Delete All User Stories" : "Delete User Story"}
                description={
                    storyToDelete === "ALL"
                        ? "Are you sure you want to delete ALL user stories? This action cannot be undone and will permanently remove everything from this list."
                        : "Are you sure you want to delete this user story? This action cannot be undone."
                }
                confirmText={storyToDelete === "ALL" ? "Delete All" : "Delete Story"}
            />

        </div >
    );
}
