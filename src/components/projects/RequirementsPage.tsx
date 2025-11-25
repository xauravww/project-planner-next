"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, Wand2 } from "lucide-react";
import { generateRequirements } from "@/actions/project";
import { createRequirement, updateRequirement, deleteRequirement } from "@/actions/crud";
import { AIGenerationModal } from "./AIGenerationModal";
import { ImproveButton } from "@/components/ui/ImproveButton";

export default function RequirementsPageClient({
    project,
    requirements,
}: {
    project: any;
    requirements: any[];
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "functional",
        priority: "must-have",
    });

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleGenerateClick = () => {
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generateRequirements(project.id, answers);
        setIsGenerating(false);
        window.location.reload();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            await updateRequirement(editingId, formData);
            setEditingId(null);
        } else {
            await createRequirement(project.id, formData);
            setIsAdding(false);
        }

        setFormData({ title: "", content: "", type: "functional", priority: "must-have" });
        window.location.reload();
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

    const handleDelete = async (id: string) => {
        if (confirm("Delete this requirement?")) {
            await deleteRequirement(id);
            window.location.reload();
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/20">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Requirements</h1>
                    <p className="text-sm text-gray-400 mt-1">{project.name}</p>
                </div>
                {!isAdding && !editingId && (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Requirement
                        </Button>
                        <Button
                            onClick={handleGenerateClick}
                            disabled={isGenerating}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            {isGenerating ? "Generating..." : "Generate with AI"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {/* Add/Edit Form */}
                {(isAdding || editingId) && (
                    <div className="p-6">
                        <GlassCard className="p-6">
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
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        {editingId ? "Update" : "Create"}
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
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wand2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Requirements Yet</h3>
                            <p className="text-gray-400">Add manually or let AI generate them</p>
                        </div>
                    </div>
                ) : !isAdding && !editingId && (
                    <div className="p-6 space-y-3">
                        {requirements.map((req: any) => (
                            <GlassCard key={req.id} className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-base font-semibold text-white">{req.title}</h3>
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
                                        <p className="text-sm text-gray-300">{req.content}</p>
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
                onClose={() => setIsAIModalOpen(false)}
                projectId={project.id}
                type="requirements"
                onGenerate={handleAIGenerate}
            />
        </div >
    );
}
