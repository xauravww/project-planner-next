"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, User, Target, Frown, Sparkles, Trash2, Pencil, Save, X, Wand2 } from "lucide-react";
import { createPersona, updatePersona, deletePersona } from "@/actions/crud";
import { generatePersonas } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function PersonasPage({ params, personas, projectName }: { params: { id: string }; personas: any[]; projectName: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        goals: "",
        frustrations: "",
        bio: "",
    });

    const handleCreate = async () => {
        if (!formData.name) return;
        await createPersona(params.id, formData);
        setIsModalOpen(false);
        setFormData({ name: "", role: "", goals: "", frustrations: "", bio: "" });
        window.location.reload();
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updatePersona(editingId, formData);
        setEditingId(null);
        setFormData({ name: "", role: "", goals: "", frustrations: "", bio: "" });
        window.location.reload();
    };

    const handleEdit = (persona: any) => {
        setEditingId(persona.id);
        setFormData({
            name: persona.name,
            role: persona.role,
            goals: persona.goals,
            frustrations: persona.frustrations,
            bio: persona.bio,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this persona?")) {
            await deletePersona(id);
            window.location.reload();
        }
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generatePersonas(params.id, answers);
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
                                { label: "Personas" },
                            ]}
                        />
                        <h1 className="text-2xl font-semibold text-white mt-2">User Personas</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => {
                            setEditingId(null);
                            setFormData({ name: "", role: "", goals: "", frustrations: "", bio: "" });
                            setIsModalOpen(true);
                        }} className="bg-white text-black hover:bg-gray-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Persona
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
                    {personas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                <User className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Personas Yet</h3>
                            <p className="text-gray-400 max-w-md mb-6">
                                Create user personas to better understand your target audience and their needs.
                            </p>
                            <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-5 h-5 mr-2" />
                                Create First Persona
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {personas.map((persona) => (
                                <GlassCard key={persona.id} className="p-6 relative group">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(persona)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(persona.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                                            {persona.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{persona.name}</h3>
                                            <p className="text-blue-400">{persona.role}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                                <Target className="w-4 h-4" /> Goals
                                            </h4>
                                            <p className="text-sm text-gray-300">{persona.goals}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                                <Frown className="w-4 h-4" /> Frustrations
                                            </h4>
                                            <p className="text-sm text-gray-300">{persona.frustrations}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Bio</h4>
                                            <p className="text-sm text-gray-300 line-clamp-3">{persona.bio}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <GlassCard className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold text-white mb-6">
                                {editingId ? "Edit Persona" : "New Persona"}
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="e.g. Sarah Smith"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Role</label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="e.g. Marketing Manager"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full h-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="Short biography..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Goals</label>
                                    <textarea
                                        value={formData.goals}
                                        onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                        className="w-full h-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="What are they trying to achieve?"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Frustrations</label>
                                    <textarea
                                        value={formData.frustrations}
                                        onChange={(e) => setFormData({ ...formData, frustrations: e.target.value })}
                                        className="w-full h-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="What are their pain points?"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={editingId ? handleUpdate : handleCreate} className="bg-blue-600 hover:bg-blue-700">
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
                onClose={() => setIsAIModalOpen(false)}
                projectId={params.id}
                type="personas"
                onGenerate={handleAIGenerate}
            />
        </ProjectLayout>
    );
}
