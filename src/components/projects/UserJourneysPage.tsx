"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, Map, Trash2, Pencil, ArrowRight, Wand2, Loader2 } from "lucide-react";
import { createUserJourney, updateUserJourney, deleteUserJourney } from "@/actions/crud";
import { generateUserJourneys } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { MessageContent } from "@/components/chat/MessageContent";
import { ImproveButton } from "@/components/ui/ImproveButton";
import { queryKeys } from "@/lib/query-client";

export default function UserJourneysPage({ params, initialJourneys, projectName }: { params: { id: string }; initialJourneys: any[]; projectName: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        steps: "",
    });

    const { data: journeys = initialJourneys } = useQuery({
        queryKey: queryKeys.projects.journeys(params.id),
        queryFn: async () => initialJourneys,
        initialData: initialJourneys,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createUserJourney(params.id, data),
        onSuccess: () => {
            toast.success("Journey created");
            setIsModalOpen(false);
            setFormData({ title: "", steps: "" });
            router.refresh();
        },
        onError: () => toast.error("Failed to create journey"),
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: any }) => updateUserJourney(vars.id, vars.data),
        onSuccess: () => {
            toast.success("Journey updated");
            setEditingId(null);
            setFormData({ title: "", steps: "" });
            setIsModalOpen(false);
            router.refresh();
        },
        onError: () => toast.error("Failed to update journey"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUserJourney(id),
        onSuccess: () => {
            toast.success("Journey deleted");
            router.refresh();
        },
        onError: () => toast.error("Failed to delete journey"),
    });

    const aiGenerateMutation = useMutation({
        mutationFn: (answers: Array<{ question: string; selected: string[] }>) => generateUserJourneys(params.id, answers),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Journeys generated");
                await queryClient.invalidateQueries({ queryKey: queryKeys.projects.journeys(params.id) });
                setIsAIModalOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to generate");
            }
        },
        onError: () => toast.error("Failed to generate journeys"),
    });

    const handleCreate = async () => {
        if (!formData.title) return;
        await createMutation.mutateAsync(formData);
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updateMutation.mutateAsync({ id: editingId, data: formData });
    };

    const handleEdit = (journey: any) => {
        setEditingId(journey.id);
        setFormData({
            title: journey.title,
            steps: journey.steps,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this journey?")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        await aiGenerateMutation.mutateAsync(answers);
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col">
                <div className="border-b border-[var(--color-nebula-hairline-strong)] px-6 py-4 flex items-center justify-between bg-[var(--color-nebula-bg)]">
                    <div>
                        <Breadcrumb
                            items={[
                                { label: "Projects", href: "/dashboard" },
                                { label: projectName, href: `/projects/${params.id}` },
                                { label: "Journeys" },
                            ]}
                        />
                        <h1 className="type-h2 mt-2">User Journeys</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="nebula" onClick={() => {
                            setEditingId(null);
                            setFormData({ title: "", steps: "" });
                            setIsModalOpen(true);
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Journey
                        </Button>
                        <Button
                            variant="nebula-ghost"
                            onClick={() => setIsAIModalOpen(true)}
                            disabled={aiGenerateMutation.isPending}
                        >
                            {aiGenerateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Wand2 className="w-4 h-4 mr-2" />
                            )}
                            {aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {journeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] flex items-center justify-center mb-6">
                                <Map className="w-10 h-10 text-[color:var(--color-charcoal)]" />
                            </div>
                            <h3 className="type-h3 mb-2">No Journeys Yet</h3>
                            <p className="type-body text-[color:var(--color-charcoal)] max-w-md mb-6">
                                Map out user flows and experiences to ensure a smooth user journey.
                            </p>
                            <Button variant="nebula" onClick={() => setIsModalOpen(true)} size="lg">
                                <Plus className="w-5 h-5 mr-2" />
                                Create First Journey
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {journeys.map((journey) => (
                                <GlassCard key={journey.id} className="p-6 relative group">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(journey)} className="p-2 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface-elevated)] rounded-[var(--r-md)] text-[color:var(--color-nebula-fg)]">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(journey.id)} className="p-2 bg-[var(--color-accent-red-glow)] hover:bg-[var(--color-accent-red-glow)] rounded-[var(--r-md)] text-[color:var(--color-accent-red)]">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h3 className="type-h3 mb-4 flex items-center gap-3">
                                        <Map className="w-5 h-5 text-[color:var(--color-nebula-fg)]" />
                                        {journey.title}
                                    </h3>

                                    <div className="prose prose-invert max-w-none">
                                        <MessageContent content={journey.steps} />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-nebula-bg)]/80 p-4">
                        <GlassCard className="w-full max-w-2xl p-6">
                            <h2 className="type-h3 mb-6">
                                {editingId ? "Edit Journey" : "New Journey"}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="type-small text-[color:var(--color-charcoal)]">Title</label>
                                        <ImproveButton
                                            currentText={formData.title}
                                            fieldType="user journey title"
                                            onImprove={(improved) => setFormData({ ...formData, title: improved })}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] focus:outline-none focus:border-[color:var(--color-nebula-fg)]"
                                        placeholder="e.g., User Onboarding Flow"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="type-small text-[color:var(--color-charcoal)]">Steps</label>
                                        <ImproveButton
                                            currentText={formData.steps}
                                            fieldType="user journey steps"
                                            onImprove={(improved) => setFormData({ ...formData, steps: improved })}
                                        />
                                    </div>
                                    <p className="type-caption mb-2">Describe the user journey step-by-step</p>
                                    <textarea
                                        value={formData.steps}
                                        onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                                        className="w-full h-64 bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] resize-none focus:outline-none focus:border-[color:var(--color-nebula-fg)] text-mono text-sm"
                                        placeholder={`Example:\n1. User lands on homepage\n2. Clicks 'Get Started' button\n3. Completes profile setup\n4. Receives welcome email\n5. Begins using the platform`}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="nebula-ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button variant="nebula" onClick={editingId ? handleUpdate : handleCreate}>
                                        {editingId ? "Save Changes" : "Create Journey"}
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
                type="journeys"
                onGenerate={handleAIGenerate}
                isGenerating={aiGenerateMutation.isPending}
            />
        </ProjectLayout>
    );
}
