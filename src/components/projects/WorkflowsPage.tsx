"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, Wand2, Sparkles, Loader2 } from "lucide-react";
import { generateWorkflows } from "@/actions/project";
import { createWorkflow, updateWorkflow, deleteWorkflow } from "@/actions/crud";
import { MessageContent } from "@/components/chat/MessageContent";
import CanvasViewer from "@/components/ui/CanvasViewer";
import { AIGenerationModal } from "./AIGenerationModal";
import { queryKeys } from "@/lib/query-client";

export default function WorkflowsPageClient({
    project,
    initialWorkflows,
}: {
    project: any;
    initialWorkflows: any[];
}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        diagram: "",
    });

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const { data: workflows = initialWorkflows } = useQuery({
        queryKey: queryKeys.projects.workflows(project.id),
        queryFn: async () => initialWorkflows,
        initialData: initialWorkflows,
    });

    const createMutation = useMutation({
        mutationFn: (vars: { projectId: string; data: any }) => createWorkflow(vars.projectId, vars.data),
        onSuccess: () => {
            toast.success("Workflow created");
            router.refresh();
        },
        onError: () => toast.error("Failed to create workflow"),
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: any }) => updateWorkflow(vars.id, vars.data),
        onSuccess: () => {
            toast.success("Workflow updated");
            router.refresh();
        },
        onError: () => toast.error("Failed to update workflow"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteWorkflow(id),
        onSuccess: () => {
            toast.success("Workflow deleted");
            router.refresh();
        },
        onError: () => toast.error("Failed to delete workflow"),
    });

    const aiGenerateMutation = useMutation({
        mutationFn: (answers: Array<{ question: string; selected: string[] }>) => generateWorkflows(project.id, answers),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success(`Generated ${result.count} workflows`);
                await queryClient.invalidateQueries({ queryKey: queryKeys.projects.workflows(project.id) });
                router.refresh();
            } else {
                toast.error(result.error || "Failed to generate workflows");
            }
        },
        onError: () => toast.error("Failed to generate workflows"),
    });

    const handleGenerateClick = () => {
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        await aiGenerateMutation.mutateAsync(answers);
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
            await updateMutation.mutateAsync({ id: editingId, data: { ...formData, content: contentToSave } });
            setEditingId(null);
        } else {
            await createMutation.mutateAsync({ projectId: project.id, data: { ...formData, content: contentToSave } });
            setIsAdding(false);
        }

        setFormData({ title: "", content: "", diagram: "" });
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
            await deleteMutation.mutateAsync(id);
        }
    };

    const renderSteps = (contentJson: string) => {
        try {
            const parsed = JSON.parse(contentJson);
            if (parsed.steps && Array.isArray(parsed.steps)) {
                return (
                    <ol className="list-decimal list-inside space-y-1 type-small text-[color:var(--color-charcoal)]">
                        {parsed.steps.map((step: any, idx: number) => (
                            <li key={idx}>
                                {typeof step === 'object'
                                    ? (step.description || step.text || step.content || JSON.stringify(step))
                                    : step}
                            </li>
                        ))}
                    </ol>
                );
            }
            if (typeof parsed === 'object') {
                return <pre className="text-mono text-xs text-[color:var(--color-nebula-fg-soft)] p-2 bg-[var(--color-surface-deep)] rounded-[var(--r-lg)] border border-[var(--color-nebula-hairline-strong)]">{JSON.stringify(parsed, null, 2)}</pre>;
            }
        } catch { }
        return <p className="text-[color:var(--color-charcoal)]">{contentJson}</p>;
    };

    return (
        <div className="h-full flex flex-col overflow-auto">
            {/* Header */}
            <div className="nebula-hairline-b px-4 lg:px-6 py-4 bg-[var(--color-nebula-bg)]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="text-center lg:text-left">
                            <h1 className="type-h3">Workflows</h1>
                        </div>
                        {!isAdding && !editingId && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                <Button
                                    onClick={() => setIsAdding(true)}
                                    variant="nebula"
                                    className="text-sm px-4 py-2"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Add Workflow</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                                <Button
                                    variant="nebula-ghost"
                                    onClick={handleGenerateClick}
                                    disabled={aiGenerateMutation.isPending}
                                    className="text-sm px-4 py-2"
                                >
                                    {aiGenerateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-4 h-4 mr-2" />
                                    )}
                                    <span className="hidden sm:inline">{aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}</span>
                                    <span className="sm:hidden">{aiGenerateMutation.isPending ? "Generating..." : "AI Generate"}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                    {/* Add/Edit Form */}
                    {(isAdding || editingId) && (
                        <div className="mb-6">
                            <GlassCard className="p-6">
                                <h3 className="type-h4 mb-4">
                                    {editingId ? "Edit Workflow" : "New Workflow"}
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="type-small text-[color:var(--color-charcoal)] mb-2 block">Title</label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="type-small text-[color:var(--color-charcoal)] mb-2 block">
                                            Steps (One per line)
                                        </label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-4 py-3 text-[color:var(--color-nebula-fg)] resize-none"
                                            rows={6}
                                            required
                                            placeholder="Step 1: User logs in&#10;Step 2: User clicks dashboard..."
                                        />
                                    </div>
                                    <div>
                                        <label className="type-small text-[color:var(--color-charcoal)] mb-2 block">
                                            Diagram (Mermaid syntax - optional)
                                        </label>
                                        <textarea
                                            value={formData.diagram}
                                            onChange={(e) => setFormData({ ...formData, diagram: e.target.value })}
                                            className="w-full bg-[var(--color-surface-deep)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-4 py-3 text-mono text-[color:var(--color-nebula-fg-soft)] text-sm resize-none"
                                            rows={8}
                                            placeholder="flowchart TD&#10;  A[Start] --> B[Process]&#10;  B --> C[End]"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="submit" variant="nebula">
                                            {editingId ? "Update Workflow" : "Create Workflow"}
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
                            <div className="text-center max-w-md mx-auto px-4">
                                <div className="w-20 h-20 bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] flex items-center justify-center mx-auto mb-6 border border-[var(--color-nebula-hairline-strong)]">
                                    <Sparkles className="w-10 h-10 text-[color:var(--color-nebula-fg)]" />
                                </div>
                                <h3 className="type-h3 mb-3">No Workflows Yet</h3>
                                <p className="type-body text-[color:var(--color-charcoal)] mb-6">Generate workflows with AI or add them manually</p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button
                                        onClick={handleGenerateClick}
                                        disabled={aiGenerateMutation.isPending}
                                        variant="nebula"
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
                        <div className="p-6 space-y-4">
                            {workflows.map((wf: any) => (
                                <GlassCard key={wf.id} className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="type-h4">{wf.title}</h3>
                                        <div className="flex gap-1 ml-4">
                                            <button
                                                onClick={() => handleEdit(wf)}
                                                className="p-2 hover:bg-[var(--color-surface-elevated)] rounded transition-colors"
                                            >
                                                <Pencil className="w-4 h-4 text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)]" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(wf.id)}
                                                className="p-2 hover:bg-[var(--color-surface-elevated)] rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-[color:var(--color-charcoal)] hover:text-[color:var(--color-accent-red)]" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Steps */}
                                    <div className="mb-4">
                                        <h4 className="type-small text-[color:var(--color-charcoal)] mb-2">Steps:</h4>
                                        {renderSteps(wf.content)}
                                    </div>

                                    {/* Diagram */}
                                    {wf.diagram && (
                                        <div>
                                            <h4 className="type-small text-[color:var(--color-charcoal)] mb-3">Flow Diagram:</h4>
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
            </div>
            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => {
                    setIsAIModalOpen(false);
                    aiGenerateMutation.reset();
                }}
                projectId={project.id}
                type="workflows"
                onGenerate={handleAIGenerate}
                isGenerating={aiGenerateMutation.isPending}
            />
        </div>
    );
}

