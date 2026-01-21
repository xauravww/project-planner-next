"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Wand2, Pencil, Trash2, Save, X, Download, Share2, Sparkles, FileText, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateArchitecture } from "@/actions/project";
import { updateArchitecture, deleteArchitecture } from "@/actions/crud";
import { MessageContent } from "@/components/chat/MessageContent";
import CanvasViewer from "@/components/ui/CanvasViewer";
import { AIGenerationModal } from "./AIGenerationModal";
import { ArchitectureTabs } from "./ArchitectureTabs";
import { StaleModuleBanner } from "@/components/ui/StaleModuleBanner";

export default function ArchitecturePageClient({
    project,
    architecture,
    staleStatus = {},
}: {
    project: any;
    architecture: any;
    staleStatus?: Record<string, any>;
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeView, setActiveView] = useState<"overview" | "highLevel" | "lowLevel" | "functional" | "diagram">("overview");
    const [formData, setFormData] = useState({
        content: architecture?.content || "",
        highLevel: architecture?.highLevel || "",
        lowLevel: architecture?.lowLevel || "",
        functionalDecomposition: architecture?.functionalDecomposition || "",
        diagram: architecture?.diagram || "",
    });

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleGenerateClick = () => {
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        try {
            await generateArchitecture(project.id, answers);
            setIsAIModalOpen(false); // Close modal before reload
            window.location.reload();
        } catch (error) {
            console.error("Generation failed:", error);
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (architecture?.id) {
            await updateArchitecture(architecture.id, formData);
            setIsEditing(false);
            window.location.reload();
        }
    };

    const handleDelete = () => {
        console.log("Delete button clicked");
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        console.log("confirmDelete called");
        if (architecture?.id) {
            setIsDeleting(true);
            try {
                console.log("Deleting architecture:", architecture.id);
                const result = await deleteArchitecture(architecture.id);
                console.log("Delete result:", result);

                if (result.error) {
                    console.error("Delete failed:", result.error);
                    alert("Failed to delete architecture: " + result.error);
                    setDeleteModalOpen(false);
                    setIsDeleting(false);
                    return;
                }

                console.log("Delete successful, closing modal");
                setDeleteModalOpen(false);
                window.location.reload();
            } catch (error) {
                console.error("Delete error:", error);
                alert("An error occurred while deleting the architecture");
                setDeleteModalOpen(false);
                setIsDeleting(false);
            }
        } else {
            console.error("No architecture ID found");
            alert("No architecture found to delete");
            setDeleteModalOpen(false);
        }
    };

    return (
        <div className="h-full flex flex-col relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] -z-10" />

            {/* Header */}
            <div className="border-b border-white/10 px-4 lg:px-6 py-4 lg:py-6 bg-black/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4 justify-center lg:justify-start">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                                <Network className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                            </div>
                            <div className="text-center lg:text-left">
                                <h1 className="text-xl lg:text-2xl font-bold text-white">Architecture</h1>
                                <p className="text-sm text-muted-foreground mt-0.5">System design & component structure</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                            {!architecture ? (
                                <Button
                                    onClick={handleGenerateClick}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/20 text-sm px-4 py-2"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">{isGenerating ? "Generating..." : "Generate with AI"}</span>
                                    <span className="sm:hidden">{isGenerating ? "Generating..." : "AI Generate"}</span>
                                </Button>
                            ) : (
                                <>
                                    {isEditing ? (
                                        <>
                                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 text-sm px-4 py-2">
                                                <Save className="w-4 h-4 mr-2" />
                                                <span className="hidden sm:inline">Save Changes</span>
                                                <span className="sm:hidden">Save</span>
                                            </Button>
                                            <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-sm px-4 py-2">
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="glass" className="gap-2 text-sm px-4 py-2">
                                                <Share2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">Share</span>
                                            </Button>
                                            <Button variant="glass" className="gap-2 text-sm px-4 py-2">
                                                <Download className="w-4 h-4" />
                                                <span className="hidden sm:inline">Export</span>
                                            </Button>
                                            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2">
                                                <Pencil className="w-4 h-4 mr-2" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </Button>
                                             <Button onClick={handleDelete} variant="ghost" className="text-red-400 hover:text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20 border border-transparent hover:border-red-500/40 p-2 transition-all duration-200">
                                                  <Trash2 className="w-4 h-4" />
                                              </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto overflow-x-hidden">
                <div className="p-2 sm:p-4 lg:p-6 w-full max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto box-border">
                    {!architecture && !isGenerating ? (
                        <div className="flex items-center justify-center h-full p-4 sm:p-8">
                            <div className="max-w-sm sm:max-w-md text-center px-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-purple-500/20">
                                    <Network className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No Architecture Defined</h3>
                                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed break-words">
                                    Define your system architecture with AI assistance. We&apos;ll help you create a comprehensive design including components, data flow, and infrastructure.
                                </p>
                                <Button
                                    onClick={handleGenerateClick}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/20 text-sm sm:text-base px-3 sm:px-4 py-2 whitespace-nowrap"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    <span className="hidden xs:inline">Generate with AI</span>
                                    <span className="xs:hidden">Generate</span>
                                </Button>
                            </div>
                        </div>
                    ) : isGenerating ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center px-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white font-medium text-sm sm:text-base">Generating architecture...</p>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">This may take a moment</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6 space-y-6 overflow-x-hidden">
                            {/* Stale Module Notification */}
                            {staleStatus.architecture && (
                                <StaleModuleBanner
                                    projectId={project.id}
                                    module="architecture"
                                    reason={staleStatus.architecture.reason}
                                    changedModule={staleStatus.architecture.changedModule}
                                    updatedAt={staleStatus.architecture.updatedAt}
                                    onRegenerate={handleGenerateClick}
                                />
                            )}

                            <ArchitectureTabs projectId={project.id} architecture={architecture} />
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
            </div>

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Architecture"
                description="Are you sure you want to delete this architecture documentation? This action cannot be undone and will permanently remove all architecture data from your project."
                confirmText="Delete Architecture"
                isDeleting={isDeleting}
            />
        </div >
    );
}
