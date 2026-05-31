"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Plus, Scale, Trash2, Pencil, AlertCircle, Wand2, Sparkles, Loader2 } from "lucide-react";
import { createBusinessRule, updateBusinessRule, deleteBusinessRule, deleteAllBusinessRules } from "@/actions/crud";
import { generateBusinessRules } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { queryKeys } from "@/lib/query-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";

export default function BusinessRulesPage({ params, initialRules, projectName }: { params: { id: string }; initialRules: any[]; projectName: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        condition: "",
        action: "",
    });

    const { data: rules = initialRules } = useQuery({
        queryKey: queryKeys.projects.businessRules(params.id),
        queryFn: async () => initialRules,
        initialData: initialRules,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createBusinessRule(params.id, data),
        onSuccess: () => {
            toast.success("Business rule created");
            setIsModalOpen(false);
            setFormData({ title: "", description: "", condition: "", action: "" });
            router.refresh();
        },
        onError: () => toast.error("Failed to create business rule"),
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: any }) => updateBusinessRule(vars.id, vars.data),
        onSuccess: () => {
            toast.success("Business rule updated");
            setEditingId(null);
            setFormData({ title: "", description: "", condition: "", action: "" });
            setIsModalOpen(false);
            router.refresh();
        },
        onError: () => toast.error("Failed to update business rule"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteBusinessRule(id),
        onSuccess: () => {
            toast.success("Business rule deleted");
            setDeleteModalOpen(false);
            setRuleToDelete(null);
            router.refresh();
        },
        onError: () => toast.error("Failed to delete business rule"),
    });

    const deleteAllMutation = useMutation({
        mutationFn: (projectId: string) => deleteAllBusinessRules(projectId),
        onSuccess: () => {
            toast.success("All business rules deleted");
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.businessRules(params.id) });
            router.refresh();
        },
        onError: () => toast.error("Failed to delete all business rules"),
    });

    const aiGenerateMutation = useMutation({
        mutationFn: (answers: Array<{ question: string; selected: string[] }>) => generateBusinessRules(params.id, answers),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Business rules generated");
                await queryClient.invalidateQueries({ queryKey: queryKeys.projects.businessRules(params.id) });
                setIsAIModalOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to generate");
            }
        },
        onError: () => toast.error("Failed to generate business rules"),
    });

    const handleCreate = async () => {
        if (!formData.title) return;
        await createMutation.mutateAsync(formData);
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updateMutation.mutateAsync({ id: editingId, data: formData });
    };

    const handleEdit = (rule: any) => {
        setEditingId(rule.id);
        setFormData({
            title: rule.title,
            description: rule.description,
            condition: rule.condition || "",
            action: rule.action || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setRuleToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (ruleToDelete === "ALL") {
            await deleteAllMutation.mutateAsync(params.id);
            setDeleteModalOpen(false);
            setRuleToDelete(null);
        } else if (ruleToDelete) {
            await deleteMutation.mutateAsync(ruleToDelete);
            setDeleteModalOpen(false);
            setRuleToDelete(null);
        }
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        await aiGenerateMutation.mutateAsync(answers);
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="nebula-hairline-b px-4 lg:px-6 py-4 bg-[var(--color-nebula-bg)]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="text-center lg:text-left">
                                <Breadcrumb
                                    items={[
                                        { label: "Projects", href: "/dashboard" },
                                        { label: projectName, href: `/projects/${params.id}` },
                                        { label: "Business Rules" },
                                    ]}
                                />
                                <h1 className="type-h3 mt-2">Business Rules</h1>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                <Button onClick={() => {
                                    setEditingId(null);
                                    setFormData({ title: "", description: "", condition: "", action: "" });
                                    setIsModalOpen(true);
                                }} variant="nebula" className="text-sm px-4 py-2">
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Add Rule</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                                <Button
                                    variant="nebula-ghost"
                                    onClick={() => setIsAIModalOpen(true)}
                                    disabled={aiGenerateMutation.isPending}
                                    className="text-sm px-4 py-2"
                                >
                                    {aiGenerateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-4 h-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                                    )}
                                    <span className="hidden sm:inline">{aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}</span>
                                    <span className="sm:hidden">{aiGenerateMutation.isPending ? "Generating..." : "AI Generate"}</span>
                                </Button>
                                {rules.length > 0 && (
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

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                        {rules.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] flex items-center justify-center mb-6">
                                    <Scale className="w-10 h-10 text-[color:var(--color-charcoal)]" />
                                </div>
                                <h3 className="type-h3 mb-2">No Business Rules Yet</h3>
                                <p className="type-body text-[color:var(--color-charcoal)] max-w-md mb-6">
                                    Define the logic and constraints that govern your application&apos;s behavior.
                                </p>
                                <Button onClick={() => setIsModalOpen(true)} size="lg" variant="nebula">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create First Rule
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {rules.map((rule) => (
                                    <GlassCard key={rule.id} className="p-6 relative group">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(rule)} className="p-2 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-nebula-surface)] rounded-[var(--r-md)] text-[color:var(--color-nebula-fg)]">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(rule.id)} className="p-2 bg-[var(--color-accent-red-glow)] hover:bg-[var(--color-accent-red-glow)] rounded-[var(--r-md)] text-[color:var(--color-accent-red)]">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h3 className="type-h4 mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-[color:var(--color-nebula-fg)]" />
                                            {rule.title}
                                        </h3>
                                        <div className="text-[color:var(--color-charcoal)] text-sm mb-4">
                                            {(() => {
                                                try {
                                                    const desc = rule.description;
                                                    if (typeof desc === 'string' && (desc.startsWith('{') || desc.startsWith('['))) {
                                                        const parsed = JSON.parse(desc);
                                                        return typeof parsed === 'object' ? JSON.stringify(parsed) : desc;
                                                    }
                                                    return desc;
                                                } catch {
                                                    return rule.description;
                                                }
                                            })()}
                                        </div>

                                        <div className="space-y-3">
                                            {rule.condition && (
                                                <div className="bg-[var(--color-surface-deep)] rounded-[var(--r-lg)] p-3 border border-[var(--color-nebula-hairline-strong)]">
                                                    <span className="text-xs font-medium text-[color:var(--color-ash)] uppercase tracking-wider block mb-1">Condition</span>
                                                    <code className="text-sm text-mono text-[color:var(--color-nebula-fg-soft)]">{rule.condition}</code>
                                                </div>
                                            )}
                                            {rule.action && (
                                                <div className="bg-[var(--color-surface-deep)] rounded-[var(--r-lg)] p-3 border border-[var(--color-nebula-hairline-strong)]">
                                                    <span className="text-xs font-medium text-[color:var(--color-accent-green)] uppercase tracking-wider block mb-1">Action</span>
                                                    <code className="text-sm text-mono text-[color:var(--color-nebula-fg-soft)]">{rule.action}</code>
                                                </div>
                                            )}
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Create/Edit Modal */}
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader className="px-6 py-5 relative z-10 border-b border-[var(--color-nebula-hairline-strong)]">
                                <DialogTitle className="type-h3 text-[color:var(--color-nebula-fg)] text-center">
                                    {editingId ? "Edit Rule" : "New Business Rule"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="px-6 py-5 space-y-5">
                                <div>
                                    <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] focus:outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="e.g. Password Complexity"
                                    />
                                </div>
                                <div>
                                    <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full h-24 bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="Explain the rule..."
                                    />
                                </div>
                                <div>
                                    <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Condition (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-mono text-[color:var(--color-nebula-fg-soft)] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="IF user.password.length < 8"
                                    />
                                </div>
                                <div>
                                    <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Action (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.action}
                                        onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-mono text-[color:var(--color-nebula-fg-soft)] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="THEN reject_registration()"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="px-6 py-5 border-t border-[var(--color-nebula-hairline-strong)]">
                                <div className="flex gap-3 justify-end w-full">
                                    <Button variant="nebula-ghost" className="px-6" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={editingId ? handleUpdate : handleCreate} variant="nebula" className="px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-0 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                                        {editingId ? "Save Changes" : "Create Rule"}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => {
                    setIsAIModalOpen(false);
                    aiGenerateMutation.reset();
                }}
                projectId={params.id}
                type="business-rules"
                onGenerate={handleAIGenerate}
                isGenerating={aiGenerateMutation.isPending}
            />

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={ruleToDelete === "ALL" ? "Delete All Business Rules" : "Delete Business Rule"}
                description={
                    ruleToDelete === "ALL"
                        ? "Are you sure you want to delete ALL business rules? This action cannot be undone and will permanently remove everything from this list."
                        : "Are you sure you want to delete this business rule? This action cannot be undone."
                }
                confirmText={ruleToDelete === "ALL" ? "Delete All" : "Delete Rule"}
            />
        </ProjectLayout>
    );
}
