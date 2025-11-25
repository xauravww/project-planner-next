"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, Map, Trash2, Pencil, ArrowRight, Wand2 } from "lucide-react";
import { createUserJourney, updateUserJourney, deleteUserJourney } from "@/actions/crud";
import { generateUserJourneys } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { MessageContent } from "@/components/chat/MessageContent";

export default function UserJourneysPage({ params, journeys, projectName }: { params: { id: string }; journeys: any[]; projectName: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        steps: "",
    });

    const handleCreate = async () => {
        if (!formData.title) return;
        await createUserJourney(params.id, formData);
        setIsModalOpen(false);
        setFormData({ title: "", steps: "" });
        window.location.reload();
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updateUserJourney(editingId, formData);
        setEditingId(null);
        setFormData({ title: "", steps: "" });
        window.location.reload();
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
            await deleteUserJourney(id);
            window.location.reload();
        }
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generateUserJourneys(params.id, answers);
        setIsGenerating(false);
        window.location.reload();
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col">
                <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/20">
                    <div>
                        <Breadcrumb
                            items={[
                                { label: "Projects", href: "/dashboard" },
                                { label: projectName, href: `/projects/${params.id}` },
                                { label: "Journeys" },
                            ]}
                        />
                        <h1 className="text-2xl font-semibold text-white mt-2">User Journeys</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => {
                            setEditingId(null);
                            setFormData({ title: "", steps: "" });
                            setIsModalOpen(true);
                        }} className="bg-white text-black hover:bg-gray-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Journey
                        </Button>
                        <Button
                            onClick={() => setIsAIModalOpen(true)}
                            disabled={isGenerating}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            {isGenerating ? "Generating..." : "Generate with AI"}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {journeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                <Map className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Journeys Yet</h3>
                            <p className="text-gray-400 max-w-md mb-6">
                                Map out user flows and experiences to ensure a smooth user journey.
                            </p>
                            <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-5 h-5 mr-2" />
                                Create First Journey
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {journeys.map((journey) => (
                                <GlassCard key={journey.id} className="p-6 relative group">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(journey)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(journey.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                        <Map className="w-5 h-5 text-blue-400" />
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <GlassCard className="w-full max-w-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">
                                {editingId ? "Edit Journey" : "New Journey"}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="e.g. Sign Up Flow"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Steps (Markdown)</label>
                                    <textarea
                                        value={formData.steps}
                                        onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                                        className="w-full h-64 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                        placeholder="1. User lands on homepage&#10;2. Clicks 'Sign Up' button&#10;3. Enters email and password..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={editingId ? handleUpdate : handleCreate} className="bg-blue-600 hover:bg-blue-700">
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
                onClose={() => setIsAIModalOpen(false)}
                projectId={params.id}
                type="journeys"
                onGenerate={handleAIGenerate}
            />
        </ProjectLayout>
    );
}
