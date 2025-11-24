"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, Target, Wand2 } from "lucide-react";
import { generateUserStories } from "@/actions/project";
import { createUserStory, updateUserStory, deleteUserStory } from "@/actions/crud";
import { AIGenerationModal } from "./AIGenerationModal";

export default function UserStoriesPageClient({
    project,
    stories,
}: {
    project: any;
    stories: any[];
}) {
    const [isGenerating, setIsGenerating] = useState(false);
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

    const handleGenerateClick = () => {
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generateUserStories(project.id, answers);
        setIsGenerating(false);
        window.location.reload();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            ...formData,
            storyPoints: Number(formData.storyPoints),
        };

        if (editingId) {
            await updateUserStory(editingId, data);
            setEditingId(null);
        } else {
            await createUserStory(project.id, data);
            setIsAdding(false);
        }

        setFormData({
            title: "",
            content: "",
            acceptanceCriteria: "",
            priority: "must-have",
            storyPoints: 1,
        });
        window.location.reload();
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

    const handleDelete = async (id: string) => {
        if (confirm("Delete this user story?")) {
            await deleteUserStory(id);
            window.location.reload();
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/20">
                <div>
                    <h1 className="text-2xl font-semibold text-white">User Stories</h1>
                    <p className="text-sm text-gray-400 mt-1">{project.name}</p>
                </div>
                {!isAdding && !editingId && (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Story
                        </Button>
                        {stories.length === 0 && (
                            <Button
                                onClick={handleGenerateClick}
                                disabled={isGenerating}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Wand2 className="w-4 h-4 mr-2" />
                                {isGenerating ? "Generating..." : "Generate with AI"}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-auto">
                {/* Add/Edit Form */}
                {(isAdding || editingId) && (
                    <div className="p-6">
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
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        {editingId ? "Update" : "Create"}
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
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wand2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No User Stories Yet</h3>
                            <p className="text-gray-400">Add manually or let AI generate them</p>
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
                                        <p className="text-sm text-gray-300 italic mb-3">{story.content}</p>
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
                onClose={() => setIsAIModalOpen(false)}
                projectId={project.id}
                type="stories"
                onGenerate={handleAIGenerate}
            />
        </div >
    );
}
