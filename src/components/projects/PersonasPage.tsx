"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, User, Target, Frown, Sparkles, Trash2, Pencil, Save, X, Wand2, Loader2 } from "lucide-react";
import { createPersona, updatePersona, deletePersona } from "@/actions/crud";
import { generatePersonas } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { queryKeys } from "@/lib/query-client";

export default function PersonasPage({ params, initialPersonas, projectName }: { params: { id: string }; initialPersonas: any[]; projectName: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        goals: "",
        frustrations: "",
        bio: "",
    });

    const { data: personas = initialPersonas } = useQuery({
        queryKey: queryKeys.projects.personas(params.id),
        queryFn: async () => initialPersonas,
        initialData: initialPersonas,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createPersona(params.id, data),
        onSuccess: () => {
            toast.success("Persona created");
            setIsModalOpen(false);
            setFormData({ name: "", role: "", goals: "", frustrations: "", bio: "" });
            router.refresh();
        },
        onError: () => toast.error("Failed to create persona"),
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: any }) => updatePersona(vars.id, vars.data),
        onSuccess: () => {
            toast.success("Persona updated");
            setEditingId(null);
            setFormData({ name: "", role: "", goals: "", frustrations: "", bio: "" });
            setIsModalOpen(false);
            router.refresh();
        },
        onError: () => toast.error("Failed to update persona"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePersona(id),
        onSuccess: () => {
            toast.success("Persona deleted");
            router.refresh();
        },
        onError: () => toast.error("Failed to delete persona"),
    });

    const aiGenerateMutation = useMutation({
        mutationFn: (answers: Array<{ question: string; selected: string[] }>) => generatePersonas(params.id, answers),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Personas generated");
                await queryClient.invalidateQueries({ queryKey: queryKeys.projects.personas(params.id) });
                setIsAIModalOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to generate");
            }
        },
        onError: () => toast.error("Failed to generate personas"),
    });

    const handleCreate = async () => {
        if (!formData.name) return;
        await createMutation.mutateAsync(formData);
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updateMutation.mutateAsync({ id: editingId, data: formData });
    };

    const handleEdit = (persona: any) => {
        setEditingId(persona.id);

        // Helper to format JSON strings for textarea
        const formatForEdit = (val: any) => {
            try {
                if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) return parsed.join('\n');
                    return val;
                }
                return val;
            } catch {
                return val;
            }
        };

        setFormData({
            name: persona.name,
            role: persona.role,
            goals: formatForEdit(persona.goals),
            frustrations: formatForEdit(persona.frustrations),
            bio: persona.bio,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this persona?")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        await aiGenerateMutation.mutateAsync(answers);
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col">
                <div className="nebula-hairline-b px-6 py-4 flex items-center justify-between bg-[var(--color-nebula-bg)]">
                    <div>
                        <Breadcrumb
                            items={[
                                { label: "Projects", href: "/dashboard" },
                                { label: projectName, href: `/projects/${params.id}` },
                                { label: "Personas" },
                            ]}
                        />
                        <h1 className="type-h3 mt-2">User Personas</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="nebula" onClick={() => {
                            setEditingId(null);
                            setFormData({ name: "", role: "", goals: "", frustrations: "", bio: "" });
                            setIsModalOpen(true);
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Persona
                        </Button>
                        <Button
                            variant="nebula-ghost"
                            onClick={() => setIsAIModalOpen(true)}
                            disabled={aiGenerateMutation.isPending}
                            className="transition-all duration-300"
                        >
                            {aiGenerateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Wand2 className="w-4 h-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                            )}
                            {aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {personas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] flex items-center justify-center mb-6">
                                <User className="w-10 h-10 text-[color:var(--color-ash)]" />
                            </div>
                            <h3 className="type-h4 mb-2">No Personas Yet</h3>
                            <p className="text-[color:var(--color-charcoal)] max-w-md mb-6">
                                Create user personas to better understand your target audience and their needs.
                            </p>
                            <Button onClick={() => setIsModalOpen(true)} size="lg" variant="nebula" className="transition-all">
                                <Plus className="w-5 h-5 mr-2" />
                                Create First Persona
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {personas.map((persona) => (
                                <GlassCard key={persona.id} className="p-6 relative group">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(persona)} className="p-2 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-nebula-surface)] rounded-[var(--r-md)] text-[color:var(--color-nebula-fg)]">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(persona.id)} className="p-2 bg-[var(--color-accent-red-glow)] hover:bg-[var(--color-accent-red-glow)] rounded-[var(--r-md)] text-[color:var(--color-accent-red)]">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-nebula-hairline-strong)] flex items-center justify-center text-2xl font-bold text-[color:var(--color-nebula-fg)]">
                                            {persona.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-[color:var(--color-nebula-fg)]">{persona.name}</h3>
                                            <p className="text-[color:var(--color-accent-blue)]">{persona.role}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-[color:var(--color-ash)] mb-2 flex items-center gap-2">
                                                <Target className="w-4 h-4" /> Goals
                                            </h4>
                                            <div className="text-sm text-[color:var(--color-charcoal)]">
                                                {(() => {
                                                    try {
                                                        const goals = typeof persona.goals === 'string' ? JSON.parse(persona.goals) : persona.goals;
                                                        if (Array.isArray(goals)) {
                                                            return (
                                                                <ul className="list-disc list-inside space-y-1">
                                                                    {goals.map((goal: string, i: number) => (
                                                                        <li key={i}>{goal}</li>
                                                                    ))}
                                                                </ul>
                                                            );
                                                        }
                                                        return <p>{persona.goals}</p>;
                                                    } catch {
                                                        return <p>{persona.goals}</p>;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-[color:var(--color-ash)] mb-2 flex items-center gap-2">
                                                <Frown className="w-4 h-4" /> Frustrations
                                            </h4>
                                            <div className="text-sm text-[color:var(--color-charcoal)]">
                                                {(() => {
                                                    try {
                                                        const frustrations = typeof persona.frustrations === 'string' ? JSON.parse(persona.frustrations) : persona.frustrations;
                                                        if (Array.isArray(frustrations)) {
                                                            return (
                                                                <ul className="list-disc list-inside space-y-1">
                                                                    {frustrations.map((f: string, i: number) => (
                                                                        <li key={i}>{f}</li>
                                                                    ))}
                                                                </ul>
                                                            );
                                                        }
                                                        return <p>{persona.frustrations}</p>;
                                                    } catch {
                                                        return <p>{persona.frustrations}</p>;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-[color:var(--color-ash)] mb-2">Bio</h4>
                                            <p className="text-sm text-[color:var(--color-charcoal)] line-clamp-3">{persona.bio}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-nebula-bg)]/80 p-4">
                        <GlassCard className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="type-h4 mb-6">
                                {editingId ? "Edit Persona" : "New Persona"}
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-[color:var(--color-ash)] mb-1 block">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] focus:outline-none focus:border-[color:var(--color-nebula-fg)]"
                                            placeholder="e.g. Sarah Smith"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[color:var(--color-ash)] mb-1 block">Role</label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] focus:outline-none focus:border-[color:var(--color-nebula-fg)]"
                                            placeholder="e.g. Marketing Manager"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-[color:var(--color-ash)] mb-1 block">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full h-24 bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] resize-none focus:outline-none focus:border-[color:var(--color-nebula-fg)]"
                                        placeholder="Short biography..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-[color:var(--color-ash)] mb-1 block">Goals</label>
                                    <textarea
                                        value={formData.goals}
                                        onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                        className="w-full h-24 bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] resize-none focus:outline-none focus:border-[color:var(--color-nebula-fg)]"
                                        placeholder="What are they trying to achieve?"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-[color:var(--color-ash)] mb-1 block">Frustrations</label>
                                    <textarea
                                        value={formData.frustrations}
                                        onChange={(e) => setFormData({ ...formData, frustrations: e.target.value })}
                                        className="w-full h-24 bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] resize-none focus:outline-none focus:border-[color:var(--color-nebula-fg)]"
                                        placeholder="What are their pain points?"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={editingId ? handleUpdate : handleCreate} variant="nebula" className="transition-all">
                                        {editingId ? "Save Changes" : "Create Persona"}
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => {
                    setIsAIModalOpen(false);
                    aiGenerateMutation.reset();
                }}
                projectId={params.id}
                type="personas"
                onGenerate={handleAIGenerate}
                isGenerating={aiGenerateMutation.isPending}
            />
        </ProjectLayout>
    );
}
