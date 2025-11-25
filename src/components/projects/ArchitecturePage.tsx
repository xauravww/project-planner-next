"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Wand2, Pencil, Trash2, Save, X, Download, Share2, Sparkles, FileText, Network } from "lucide-react";
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
        if (confirm("Are you sure you want to delete this architecture documentation? This action cannot be undone.")) {
            if (architecture?.id) {
                await deleteArchitecture(architecture.id);
                window.location.reload();
            }
        }
    };

    return (
        <div className="h-full flex flex-col relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] -z-10" />

            {/* Header */}
            <div className="border-b border-white/10 px-6 py-6 flex items-center justify-between bg-black/40 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                        <Network className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Architecture</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">System design & component structure</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {!architecture ? (
                        <Button
                            onClick={handleGenerateClick}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/20"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {isGenerating ? "Generating..." : "Generate with AI"}
                        </Button>
                    ) : (
                        <>
                            {isEditing ? (
                                <>
                                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20">
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                    <Button onClick={() => setIsEditing(false)} variant="ghost">
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="glass" className="gap-2">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </Button>
                                    <Button variant="glass" className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Export
                                    </Button>
                                    <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button onClick={handleDelete} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {!architecture && !isGenerating ? (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="max-w-md text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                                <Network className="w-10 h-10 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No Architecture Defined</h3>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Define your system architecture with AI assistance. We'll help you create a comprehensive design including components, data flow, and infrastructure.
                            </p>
                            <Button
                                onClick={handleGenerateClick}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/20"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate with AI
                            </Button>
                        </div>
                    </div>
                ) : isGenerating ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-white font-medium">Generating architecture...</p>
                            <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-6 max-w-7xl mx-auto">
                        {/* Overview */}
                        <GlassCard className="p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    <h2 className="text-xl font-bold text-white">Overview</h2>
                                </div>
                                {isEditing ? (
                                    <div>
                                        <label className="text-sm text-muted-foreground mb-2 block">Architecture description (supports Markdown)</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full h-64 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="Describe your system architecture..."
                                        />
                                    </div>
                                ) : (
                                    <div className="prose prose-invert max-w-none">
                                        <MessageContent content={architecture?.content || "No description provided."} />
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Diagram */}
                        <GlassCard className="p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Network className="w-5 h-5 text-purple-400" />
                                    <h2 className="text-xl font-bold text-white">System Diagram</h2>
                                </div>
                                {isEditing ? (
                                    <div>
                                        <label className="text-sm text-muted-foreground mb-2 block">Mermaid diagram code</label>
                                        <textarea
                                            value={formData.diagram}
                                            onChange={(e) => setFormData({ ...formData, diagram: e.target.value })}
                                            className="w-full h-96 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            placeholder="graph TD&#10;  A[Client] --> B[Server]&#10;  B --> C[Database]"
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Use Mermaid syntax. See{" "}
                                            <a href="https://mermaid.js.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                documentation
                                            </a>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="min-h-[600px]">
                                        <CanvasViewer>
                                            <div className="p-6">
                                                <MessageContent content={`\`\`\`mermaid\n${architecture?.diagram}\n\`\`\``} />
                                            </div>
                                        </CanvasViewer>
                                    </div>
                                )}
                            </div>
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
