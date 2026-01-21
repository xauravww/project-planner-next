"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Plus, Scale, Trash2, Pencil, AlertCircle, Wand2 } from "lucide-react";
import { createBusinessRule, updateBusinessRule, deleteBusinessRule } from "@/actions/crud";
import { generateBusinessRules } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function BusinessRulesPage({ params, rules, projectName }: { params: { id: string }; rules: any[]; projectName: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        condition: "",
        action: "",
    });

    const handleCreate = async () => {
        if (!formData.title) return;
        await createBusinessRule(params.id, formData);
        setIsModalOpen(false);
        setFormData({ title: "", description: "", condition: "", action: "" });
        window.location.reload();
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updateBusinessRule(editingId, formData);
        setEditingId(null);
        setFormData({ title: "", description: "", condition: "", action: "" });
        window.location.reload();
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
        if (ruleToDelete) {
            await deleteBusinessRule(ruleToDelete);
            setDeleteModalOpen(false);
            setRuleToDelete(null);
            window.location.reload();
        }
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generateBusinessRules(params.id, answers);
        setIsGenerating(false);
        window.location.reload();
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="border-b border-white/10 px-4 lg:px-6 py-4 bg-black/20">
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
                                <h1 className="text-xl lg:text-2xl font-semibold text-white mt-2">Business Rules</h1>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                <Button onClick={() => {
                                    setEditingId(null);
                                    setFormData({ title: "", description: "", condition: "", action: "" });
                                    setIsModalOpen(true);
                                }} className="bg-white text-black hover:bg-gray-200 text-sm px-4 py-2">
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Add Rule</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                                <Button
                                    onClick={() => setIsAIModalOpen(true)}
                                    disabled={isGenerating}
                                    className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
                                >
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">{isGenerating ? "Generating..." : "Generate with AI"}</span>
                                    <span className="sm:hidden">{isGenerating ? "Generating..." : "AI Generate"}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                    {rules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                <Scale className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Business Rules Yet</h3>
                            <p className="text-gray-400 max-w-md mb-6">
                                Define the logic and constraints that govern your application&apos;s behavior.
                            </p>
                            <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-5 h-5 mr-2" />
                                Create First Rule
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {rules.map((rule) => (
                                <GlassCard key={rule.id} className="p-6 relative group">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(rule)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(rule.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-blue-400" />
                                        {rule.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4">{rule.description}</p>

                                    <div className="space-y-3">
                                        {rule.condition && (
                                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                <span className="text-xs font-medium text-blue-400 uppercase tracking-wider block mb-1">Condition</span>
                                                <code className="text-sm text-gray-300 font-mono">{rule.condition}</code>
                                            </div>
                                        )}
                                        {rule.action && (
                                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                <span className="text-xs font-medium text-green-400 uppercase tracking-wider block mb-1">Action</span>
                                                <code className="text-sm text-gray-300 font-mono">{rule.action}</code>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <GlassCard className="w-full max-w-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-6">
                                {editingId ? "Edit Rule" : "New Business Rule"}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="e.g. Password Complexity"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full h-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="Explain the rule..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Condition (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="IF user.password.length < 8"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Action (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.action}
                                        onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="THEN reject_registration()"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={editingId ? handleUpdate : handleCreate} className="bg-blue-600 hover:bg-blue-700">
                                        {editingId ? "Save Changes" : "Create Rule"}
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
                    </div>
                </div>
            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                projectId={params.id}
                type="business-rules"
                onGenerate={handleAIGenerate}
            />

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Business Rule"
                description="Are you sure you want to delete this business rule? This action cannot be undone."
                confirmText="Delete Rule"
            />
        </ProjectLayout>
    );
}
