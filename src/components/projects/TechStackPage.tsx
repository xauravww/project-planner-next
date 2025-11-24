"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Wand2, Pencil, Trash2, Save, Code2, Plus, X } from "lucide-react";
import { generateTechStack } from "@/actions/project";
import { updateTechStack, deleteTechStack } from "@/actions/crud";
import { AIGenerationModal } from "./AIGenerationModal";

export default function TechStackPageClient({
    project,
    techStack,
}: {
    project: any;
    techStack: any;
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const parseStack = (json: string | null) => {
        try {
            return json ? JSON.parse(json) : [];
        } catch {
            return [];
        }
    };

    const [formData, setFormData] = useState({
        frontend: parseStack(techStack?.frontend),
        backend: parseStack(techStack?.backend),
        database: parseStack(techStack?.database),
        devops: parseStack(techStack?.devops),
        other: parseStack(techStack?.other),
    });

    const [newItem, setNewItem] = useState("");
    const [activeCategory, setActiveCategory] = useState<keyof typeof formData | null>(null);

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleGenerateClick = () => {
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generateTechStack(project.id, answers);
        setIsGenerating(false);
        window.location.reload();
    };

    const handleSave = async () => {
        if (techStack?.id) {
            await updateTechStack(techStack.id, formData);
            setIsEditing(false);
            window.location.reload();
        }
    };

    const handleDelete = async () => {
        if (confirm("Delete tech stack?")) {
            if (techStack?.id) {
                await deleteTechStack(techStack.id);
                window.location.reload();
            }
        }
    };

    const addItem = (category: keyof typeof formData) => {
        if (newItem.trim()) {
            setFormData({
                ...formData,
                [category]: [...formData[category], newItem.trim()],
            });
            setNewItem("");
            setActiveCategory(null);
        }
    };

    const removeItem = (category: keyof typeof formData, index: number) => {
        const newArray = [...formData[category]];
        newArray.splice(index, 1);
        setFormData({
            ...formData,
            [category]: newArray,
        });
    };

    const renderCategory = (title: string, category: keyof typeof formData, iconColor: string) => {
        const items = isEditing ? formData[category] : parseStack(techStack?.[category]);
        if (!isEditing && items.length === 0) return null;

        return (
            <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${iconColor}-500/20 flex items-center justify-center border border-${iconColor}-500/30`}>
                            <Code2 className={`w-5 h-5 text-${iconColor}-400`} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    {items.map((tech: any, idx: number) => {
                        const techName = typeof tech === 'string' ? tech : tech.name;
                        return (
                            <span
                                key={idx}
                                className={`px-3 py-1.5 bg-${iconColor}-500/10 text-${iconColor}-300 rounded-lg text-sm border border-${iconColor}-500/20 flex items-center gap-2`}
                            >
                                {techName}
                                {isEditing && (
                                    <button
                                        onClick={() => removeItem(category, idx)}
                                        className="hover:text-white transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </span>
                        );
                    })}
                </div>

                {isEditing && activeCategory === category && (
                    <div className="flex gap-2 mt-3">
                        <Input
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Add technology..."
                            onKeyPress={(e) => e.key === 'Enter' && addItem(category)}
                        />
                        <Button onClick={() => addItem(category)} className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => setActiveCategory(null)} variant="ghost">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {isEditing && activeCategory !== category && (
                    <Button
                        onClick={() => setActiveCategory(category)}
                        variant="ghost"
                        className="text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                )}
            </GlassCard>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/20">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Tech Stack</h1>
                    <p className="text-sm text-gray-400 mt-1">{project.name}</p>
                </div>
                <div className="flex gap-3">
                    {!techStack ? (
                        <Button
                            onClick={handleGenerateClick}
                            disabled={isGenerating}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            {isGenerating ? "Generating..." : "Generate with AI"}
                        </Button>
                    ) : (
                        <>
                            {isEditing ? (
                                <>
                                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                    <Button onClick={() => setIsEditing(false)} variant="ghost">
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)} className="bg-white text-black hover:bg-gray-200">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                            <Button onClick={handleDelete} className="bg-red-600/20 text-red-400 hover:bg-red-600/30">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {!techStack && !isGenerating ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wand2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Tech Stack Yet</h3>
                            <p className="text-gray-400">Generate with AI to create technology recommendations</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-4">
                        {/* Rationale */}
                        {techStack?.rationale && (
                            <GlassCard className="p-5">
                                <h3 className="text-lg font-semibold text-white mb-3">Rationale</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">{techStack.rationale}</p>
                            </GlassCard>
                        )}

                        {/* Categories */}
                        {renderCategory("Frontend", "frontend", "blue")}
                        {renderCategory("Backend", "backend", "green")}
                        {renderCategory("Database", "database", "purple")}
                        {renderCategory("DevOps", "devops", "orange")}
                        {renderCategory("Other", "other", "gray")}
                    </div>
                )}
            </div>
            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                projectId={project.id}
                type="tech-stack"
                onGenerate={handleAIGenerate}
            />
        </div >
    );
}
