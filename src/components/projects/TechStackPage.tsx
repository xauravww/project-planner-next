"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Wand2, Pencil, Trash2, Save, Code2, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { generateTechStack } from "@/actions/project";
import { updateTechStack, deleteTechStack } from "@/actions/crud";
import { AIGenerationModal } from "./AIGenerationModal";
import { queryKeys } from "@/lib/query-client";

export default function TechStackPageClient({
    project,
    initialTechStack,
}: {
    project: any;
    initialTechStack: any;
}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const parseStack = (json: string | null) => {
        try {
            return json ? JSON.parse(json) : [];
        } catch {
            return [];
        }
    };

    const [formData, setFormData] = useState({
        frontend: parseStack(initialTechStack?.frontend),
        backend: parseStack(initialTechStack?.backend),
        database: parseStack(initialTechStack?.database),
        devops: parseStack(initialTechStack?.devops),
        other: parseStack(initialTechStack?.other),
    });

    const [newItem, setNewItem] = useState("");
    const [activeCategory, setActiveCategory] = useState<keyof typeof formData | null>(null);

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const { data: techStack = initialTechStack } = useQuery({
        queryKey: queryKeys.projects.techStack(project.id),
        queryFn: async () => initialTechStack,
        initialData: initialTechStack,
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => techStack?.id ? updateTechStack(techStack.id, data) : Promise.resolve({ error: "No tech stack" }),
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Tech stack updated");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update");
            }
        },
        onError: () => toast.error("Failed to update tech stack"),
    });

    const deleteMutation = useMutation({
        mutationFn: () => techStack?.id ? deleteTechStack(techStack.id) : Promise.resolve({ error: "No tech stack" }),
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Tech stack deleted");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete");
            }
        },
        onError: () => toast.error("Failed to delete tech stack"),
    });

    const aiGenerateMutation = useMutation({
        mutationFn: (answers: Array<{ question: string; selected: string[] }>) => generateTechStack(project.id, answers),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Tech stack generated");
                await queryClient.invalidateQueries({ queryKey: queryKeys.projects.techStack(project.id) });
                setIsAIModalOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to generate");
            }
        },
        onError: () => toast.error("Failed to generate tech stack"),
    });

    const handleGenerateClick = () => {
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        await aiGenerateMutation.mutateAsync(answers);
    };

    const handleSave = async () => {
        await updateMutation.mutateAsync(formData);
    };

    const handleDelete = async () => {
        if (confirm("Delete tech stack?")) {
            await deleteMutation.mutateAsync();
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
                    </div>
                )}
            </GlassCard>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 px-4 lg:px-6 py-4 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="text-center lg:text-left">
                            <h1 className="text-xl lg:text-2xl font-semibold text-white">Tech Stack</h1>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                            {!techStack ? (
                                <Button
                                    variant="glass"
                                    onClick={handleGenerateClick}
                                    disabled={aiGenerateMutation.isPending}
                                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 hover:border-indigo-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] text-sm px-4 py-2"
                                >
                                    {aiGenerateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-4 h-4 mr-2 text-indigo-400" />
                                    )}
                                    <span className="hidden sm:inline">{aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}</span>
                                    <span className="sm:hidden">{aiGenerateMutation.isPending ? "Generating..." : "AI Generate"}</span>
                                </Button>
                            ) : (
                                <>
                                    {isEditing ? (
                                        <>
                                            <Button onClick={handleSave} className="bg-green-600/90 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all text-sm px-4 py-2">
                                                <Save className="w-4 h-4 mr-2" />
                                                <span className="hidden sm:inline">Save</span>
                                            </Button>
                                            <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-sm px-4 py-2">
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => setIsEditing(true)} className="bg-white text-black hover:bg-gray-200 text-sm px-4 py-2">
                                            <Pencil className="w-4 h-4 mr-2" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </Button>
                                    )}
                                    <Button onClick={handleDelete} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                    {!techStack && !aiGenerateMutation.isPending ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Code2 className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Tech Stack Defined</h3>
                                <p className="text-gray-400">Generate your tech stack with AI</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {renderCategory("Frontend", "frontend", "blue")}
                            {renderCategory("Backend", "backend", "green")}
                            {renderCategory("Database", "database", "purple")}
                            {renderCategory("DevOps", "devops", "orange")}
                            {renderCategory("Other", "other", "gray")}
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
                type="tech-stack"
                onGenerate={handleAIGenerate}
                isGenerating={aiGenerateMutation.isPending}
            />
        </div>
    );
}
