"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, Wand2 } from "lucide-react";
import { generateWorkflows } from "@/actions/project";
import { createWorkflow, updateWorkflow, deleteWorkflow } from "@/actions/crud";
import { MessageContent } from "@/components/chat/MessageContent";
import CanvasViewer from "@/components/ui/CanvasViewer";
import { AIGenerationModal } from "./AIGenerationModal";

export default function WorkflowsPageClient({
    project,
    workflows,
}: {
    project: any;
    workflows: any[];
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        diagram: "",
    });

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleGenerateClick = () => {
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generateWorkflows(project.id, answers);
        setIsGenerating(false);
        window.location.reload();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let contentToSave = formData.content;
        try {
            if (!formData.content.trim().startsWith("{") && !formData.content.trim().startsWith("[")) {
                const steps = formData.content.split("\n").filter(line => line.trim());
                contentToSave = JSON.stringify({ steps });
            }
        } catch (e) {
            // keep as is
        }

        if (editingId) {
            await updateWorkflow(editingId, { ...formData, content: contentToSave });
            setEditingId(null);
        } else {
            await createWorkflow(project.id, { ...formData, content: contentToSave });
            setIsAdding(false);
        }

        setFormData({ title: "", content: "", diagram: "" });
        window.location.reload();
    };

    const handleEdit = (wf: any) => {
        setEditingId(wf.id);
        let content = wf.content;
        try {
            const parsed = JSON.parse(wf.content);
            if (parsed.steps && Array.isArray(parsed.steps)) {
                content = parsed.steps.join("\n");
            }
        } catch { }

        setFormData({
            title: wf.title,
            content: content,
            diagram: wf.diagram || "",
        });
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this workflow?")) {
            await deleteWorkflow(id);
            window.location.reload();
        }
    };

    const renderSteps = (contentJson: string) => {
        try {
            const parsed = JSON.parse(contentJson);
            if (parsed.steps && Array.isArray(parsed.steps)) {
                return (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                        {parsed.steps.map((step: string, idx: number) => (
                            <li key={idx}>{step}</li>
                        ))}
                    </ol>
                );
            }
        } catch { }
        return <p className="text-gray-300">{contentJson}</p>;
    };

    return (
        <div className="h-full flex flex-col overflow-auto">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/20">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Workflows</h1>
                    <p className="text-sm text-gray-400 mt-1">{project.name}</p>
                </div>
                {!isAdding && !editingId && (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Workflow
                        </Button>
                        {workflows.length === 0 && (
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

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {/* Add/Edit Form */}
                {(isAdding || editingId) && (
                    <div className="p-6">
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {editingId ? "Edit Workflow" : "New Workflow"}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-2 block">Title</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                                        Steps (One per line)
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                                        rows={6}
                                        required
                                        placeholder="Step 1: User logs in&#10;Step 2: User clicks dashboard..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                                        Diagram (Mermaid syntax - optional)
                                    </label>
                                    <textarea
                                        value={formData.diagram}
                                        onChange={(e) => setFormData({ ...formData, diagram: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm resize-none"
                                        rows={8}
                                        placeholder="flowchart TD&#10;  A[Start] --> B[Process]&#10;  B --> C[End]"
                                    />
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
                                            setFormData({ title: "", content: "", diagram: "" });
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

                {/* Workflows List */}
                {workflows.length === 0 && !isAdding ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wand2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Workflows Yet</h3>
                            <p className="text-gray-400">Add manually or let AI generate them</p>
                        </div>
                    </div>
                ) : !isAdding && !editingId && (
                    <div className="p-6 space-y-4">
                        {workflows.map((wf: any) => (
                            <GlassCard key={wf.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">{wf.title}</h3>
                                    <div className="flex gap-1 ml-4">
                                        <button
                                            onClick={() => handleEdit(wf)}
                                            className="p-2 hover:bg-white/10 rounded transition-colors"
                                        >
                                            <Pencil className="w-4 h-4 text-gray-400 hover:text-white" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(wf.id)}
                                            className="p-2 hover:bg-white/10 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Steps:</h4>
                                    {renderSteps(wf.content)}
                                </div>

                                {/* Diagram */}
                                {wf.diagram && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Flow Diagram:</h4>
                                        <div className="h-[400px]">
                                            <CanvasViewer>
                                                <div className="p-4">
                                                    <MessageContent content={`\`\`\`mermaid\n${wf.diagram}\n\`\`\``} />
                                                </div>
                                            </CanvasViewer>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                projectId={project.id}
                type="workflows"
                onGenerate={handleAIGenerate}
            />
        </div>
    );
}

