"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Plus, Pencil, Trash2, Target, Wand2 } from "lucide-react";
import { deleteUserStory, deleteAllUserStories } from "@/actions/crud";
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

    const { data: stories = initialStories, refetch } = useQuery({
        queryKey: queryKeys.projects.userStories(project.id),
        queryFn: async () => {
            const res = await fetch(`/api/projects/${project.id}/stories`);
            if (!res.ok) throw new Error("Failed to fetch user stories");
            return res.json();
        },
        initialData: initialStories,
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
        onSuccess: async () => {
            toast.success("User story deleted");
            await refetch();
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
        onSuccess: async () => {
            toast.success("All user stories deleted");
            await refetch();
        },
    });

    const handleGenerateClick = () => {
        router.push(`/projects/${project.id}/stories/generate`);
    };

    const handleEdit = (story: any) => {
        router.push(`/projects/${project.id}/stories/new?edit=${story.id}`);
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
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                            <Link href={`/projects/${project.id}/stories/new`} className="nebula-btn nebula-btn--primary justify-center">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add story</span>
                                <span className="sm:hidden">Add</span>
                            </Link>
                            <Link href={`/projects/${project.id}/stories/board`} className="nebula-btn nebula-btn--ghost justify-center">
                                Overview
                            </Link>
                            <Link href={`/projects/${project.id}/stories/connections`} className="nebula-btn nebula-btn--ghost justify-center">
                                Connections
                            </Link>
                            <Button
                                variant="nebula-ghost"
                                onClick={handleGenerateClick}
                                className="transition-all duration-300 text-sm px-4 py-2"
                            >
                                <Wand2 className="w-4 h-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                                <span className="hidden sm:inline">Generate with AI</span>
                                <span className="sm:hidden">AI Generate</span>
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
                    </div>
                </div>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                    {/* Stories List */}
                    {stories.length === 0 ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center max-w-md mx-auto px-4">
                                <div className="w-20 h-20 bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] flex items-center justify-center mx-auto mb-6 border border-[var(--color-nebula-hairline-strong)]">
                                    <Target className="w-10 h-10 text-[color:var(--color-nebula-fg)]" />
                                </div>
                                <h3 className="type-h3 mb-3">No user stories yet</h3>
                                <p className="text-[color:var(--color-charcoal)]">
                                    Generate user stories with AI or add them manually using the buttons above.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {stories.map((story: any) => (
                                <div key={story.id} className="border-2 border-black bg-white p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="mb-2 text-base font-semibold text-black">{story.title}</h3>

                                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`border-2 border-black px-2 py-0.5 font-mono text-[11px] uppercase tracking-tight ${
                                                        story.priority === "must-have"
                                                            ? "bg-black text-white"
                                                            : story.priority === "should-have"
                                                                ? "text-[#FF4D00]"
                                                                : "text-black/70"
                                                    }`}
                                                >
                                                    {story.priority === "must-have" ? "Must have" : story.priority === "should-have" ? "Should have" : "Nice to have"}
                                                </span>
                                                {story.storyPoints != null && (
                                                    <span className="border-2 border-black px-2 py-0.5 font-mono text-[11px] uppercase tracking-tight text-black/70">
                                                        {story.storyPoints} pts
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-sm text-[color:var(--color-charcoal)]">
                                                {(() => {
                                                    try {
                                                        const content = story.content;
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
                                                        return story.content;
                                                    }
                                                })()}
                                            </div>

                                            {story.acceptanceCriteria && (
                                                <div className="mt-4 border-t-2 border-black pt-3">
                                                    <p className="mb-1.5 font-mono text-[11px] uppercase tracking-tight text-black/50">Acceptance criteria</p>
                                                    <div className="border-2 border-black bg-black/[0.03] p-3">
                                                        <pre className="whitespace-pre-wrap font-sans text-xs text-black/70">{story.acceptanceCriteria}</pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                onClick={() => handleEdit(story)}
                                                aria-label="Edit user story"
                                                className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(story.id)}
                                                aria-label="Delete user story"
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
