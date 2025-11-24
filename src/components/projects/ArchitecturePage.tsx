"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Wand2, Pencil, Trash2, Save, X } from "lucide-react";
import { generateArchitecture } from "@/actions/project";
import { updateArchitecture, deleteArchitecture } from "@/actions/crud";
import { MessageContent } from "@/components/chat/MessageContent";
import CanvasViewer from "@/components/ui/CanvasViewer";
import { AIGenerationModal } from "./AIGenerationModal";

export default function ArchitecturePageClient({
    project,
    architecture,
}: {
    project: any;
    architecture: any;
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        content: architecture?.content || "",
        diagram: architecture?.diagram || "",
    });

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleGenerateClick = () => {
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generateArchitecture(project.id, answers);
        setIsGenerating(false);
        window.location.reload();
    };

    const handleSave = async () => {
        if (architecture?.id) {
            await updateArchitecture(architecture.id, formData);
            setIsEditing(false);
            window.location.reload();
        }
    };

    const handleDelete = async () => {
        if (confirm("Delete architecture documentation?")) {
            if (architecture?.id) {
                await deleteArchitecture(architecture.id);
                window.location.reload();
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/20">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Architecture</h1>
                    <p className="text-sm text-gray-400 mt-1">{project.name}</p>
                </div>
                <div className="flex gap-3">
                    {!architecture ? (
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
                {!architecture && !isGenerating ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wand2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Architecture Yet</h3>
                            <p className="text-gray-400">Generate with AI to create system architecture</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Description */}
                        <GlassCard className="p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
                            {isEditing ? (
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full h-48 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                                />
                            ) : (
                                <div className="text-gray-300 whitespace-pre-wrap">
                                    {architecture?.content}
                                </div>
                            )}
                        </GlassCard>

                        {/* Diagram */}
                        <GlassCard className="p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">System Diagram</h2>
                            {isEditing ? (
                                <textarea
                                    value={formData.diagram}
                                    onChange={(e) => setFormData({ ...formData, diagram: e.target.value })}
                                    className="w-full h-64 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm resize-none"
                                />
                            ) : (
                                <div className="h-[600px]">
                                    <CanvasViewer>
                                        <div className="p-6">
                                            <MessageContent content={`\`\`\`mermaid\n${architecture?.diagram}\n\`\`\``} />
                                        </div>
                                    </CanvasViewer>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                )}
            </div>
            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                projectId={project.id}
                type="architecture"
                onGenerate={handleAIGenerate}
            />
        </div >
    );
}
