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
import { createUserStory, updateUserStory, deleteUserStory } from "@/actions/crud";
import { AIGenerationModal } from "./AIGenerationModal";
import { queryKeys } from "@/lib/query-client";

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
        if (storyToDelete) {
            await deleteMutation.mutateAsync(storyToDelete);
            setDeleteModalOpen(false);
            setStoryToDelete(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 px-4 lg:px-6 py-4 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="text-center lg:text-left">
                            <h1 className="text-xl lg:text-2xl font-semibold text-white">User Stories</h1>
                        </div>
                        {!isAdding && !editingId && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                <Button
                                    onClick={() => setIsAdding(true)}
                                    className="bg-white text-black hover:bg-gray-200 text-sm px-4 py-2"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Add Story</span>
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
                                        <Wand2 className="w-4 h-4 mr-2 text-indigo-400" />
                                    )}
                                    <span className="hidden sm:inline">{aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}</span>
                                    <span className="sm:hidden">{aiGenerateMutation.isPending ? "Generating..." : "AI Generate"}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                    {/* Add/Edit Form */}
                    {(isAdding || editingId) && (
                        <div className="mb-6">
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    {editingId ? "Edit User Story" : "New User Story"}
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 mb-2 block">Title</label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            placeholder="As a user, I want to..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                                            Acceptance Criteria
                                        </label>
                                        <textarea
                                            value={formData.acceptanceCriteria}
                                            onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                                            rows={4}
                                            placeholder="- User can see login button&#10;- User gets error on invalid input"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-300 mb-2 block">Priority</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.priority}
                                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                                                >
                                                    <option value="must-have" className="bg-zinc-900">Must Have</option>
                                                    <option value="should-have" className="bg-zinc-900">Should Have</option>
                                                    <option value="nice-to-have" className="bg-zinc-900">Nice to Have</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-300 mb-2 block">Story Points</label>
                                            <Input
                                                type="number"
                                                value={formData.storyPoints}
                                                onChange={(e) => setFormData({ ...formData, storyPoints: Number(e.target.value) })}
                                                min={1}
                                                max={13}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="submit" className="bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-all">
                                            {editingId ? "Update User Story" : "Create User Story"}
                                        </Button>
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
                                            variant="ghost"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </GlassCard>
                        </div>
                    )}

                    {/* Stories List */}
                    {stories.length === 0 && !isAdding ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center max-w-md mx-auto px-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                                    <Target className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">No User Stories Yet</h3>
                                <p className="text-gray-400 mb-6">Generate user stories with AI or add them manually</p>
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
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {stories.map((story: any) => (
                                <GlassCard key={story.id} className="p-5 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target className="w-4 h-4 text-orange-400" />
                                                <h3 className="text-base font-semibold text-white">{story.title}</h3>
                                            </div>
                                            <div className="text-sm text-gray-300 italic mb-3">
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
                                                className="p-2 hover:bg-white/10 rounded transition-colors"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-400 hover:text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(story.id)}
                                                className="p-2 hover:bg-white/10 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Acceptance Criteria */}
                                    {story.acceptanceCriteria && (
                                        <div className="mb-3">
                                            <h4 className="text-xs font-semibold text-gray-400 mb-1">Acceptance Criteria:</h4>
                                            <div className="bg-white/5 rounded p-2 border border-white/10">
                                                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">
                                                    {story.acceptanceCriteria}
                                                </pre>
                                            </div>
                                        </div>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/10">
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${story.priority === "must-have"
                                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                                : story.priority === "should-have"
                                                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                                    : "bg-green-500/20 text-green-300 border border-green-500/30"
                                                }`}
                                        >
                                            {story.priority}
                                        </span>
                                        {story.storyPoints && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
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
                title="Delete User Story"
                description="Are you sure you want to delete this user story? This action cannot be undone."
                confirmText="Delete Story"
            />

        </div >
    );
}
