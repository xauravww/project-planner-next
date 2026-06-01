"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Wand2, Pencil, Trash2, Save, X, Download, Share2, Sparkles, FileText, Network, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateArchitecture } from "@/actions/project";
import { updateArchitecture, deleteArchitecture } from "@/actions/crud";
import { MessageContent } from "@/components/chat/MessageContent";
import CanvasViewer from "@/components/ui/CanvasViewer";
import { AIGenerationModal } from "./AIGenerationModal";
import { ArchitectureTabs } from "./ArchitectureTabs";
import { StaleModuleBanner } from "@/components/ui/StaleModuleBanner";
import { queryKeys } from "@/lib/query-client";

export default function ArchitecturePageClient({
    project,
    initialArchitecture,
    staleStatus = {},
}: {
    project: any;
    initialArchitecture: any;
    staleStatus?: Record<string, any>;
}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        content: initialArchitecture?.content || "",
        highLevel: initialArchitecture?.highLevel || "",
        lowLevel: initialArchitecture?.lowLevel || "",
        functionalDecomposition: initialArchitecture?.functionalDecomposition || "",
        diagram: initialArchitecture?.diagram || "",
    });

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // Fetch architecture data from server
    const { data: architecture = initialArchitecture, refetch } = useQuery({
        queryKey: queryKeys.projects.architecture(project.id),
        queryFn: async () => {
            const res = await fetch(`/api/projects/${project.id}/architecture`);
            if (!res.ok) throw new Error("Failed to fetch architecture");
            return res.json();
        },
        initialData: initialArchitecture,
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => architecture?.id ? updateArchitecture(architecture.id, data) : Promise.resolve({ error: "No architecture" }),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Architecture updated");
                setIsEditing(false);
                // Refetch to update UI
                await refetch();
            } else {
                toast.error(result.error || "Failed to update");
            }
        },
        onError: () => toast.error("Failed to update architecture"),
    });

    const deleteMutation = useMutation({
        mutationFn: () => architecture?.id ? deleteArchitecture(architecture.id) : Promise.resolve({ error: "No architecture" }),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Architecture deleted");
                setDeleteModalOpen(false);
                // Refetch to update UI
                await refetch();
            } else {
                toast.error(result.error || "Failed to delete");
            }
        },
        onError: () => toast.error("Failed to delete architecture"),
    });

    const aiGenerateMutation = useMutation({
        mutationFn: (answers: Array<{ question: string; selected: string[] }>) => generateArchitecture(project.id, answers),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Architecture generated");
                setIsAIModalOpen(false);
                // Refetch to update UI
                await refetch();
            } else {
                toast.error(result.error || "Failed to generate architecture");
            }
        },
        onError: () => toast.error("Failed to generate architecture"),
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

    const handleDelete = () => {
        console.log("Delete button clicked");
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        await deleteMutation.mutateAsync();
    };

    return (
        <div className="h-full flex flex-col relative">
            {/* Header */}
            <div className="nebula-hairline-b px-4 lg:px-6 py-4 lg:py-6 bg-[var(--color-nebula-bg)]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4 justify-center lg:justify-start">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-[var(--r-lg)] bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] flex items-center justify-center">
                                <Network className="w-5 h-5 lg:w-6 lg:h-6 text-[color:var(--color-nebula-fg)]" />
                            </div>
                            <div className="text-center lg:text-left">
                                <h1 className="type-h3">Architecture</h1>
                                <p className="type-small text-[color:var(--color-charcoal)] mt-0.5">System design & component structure</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                            {!architecture ? (
                                <Button
                                    variant="nebula-ghost"
                                    onClick={handleGenerateClick}
                                    disabled={aiGenerateMutation.isPending}
                                    className="text-sm px-4 py-2"
                                >
                                    {aiGenerateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 mr-2" />
                                    )}
                                    <span className="hidden sm:inline">{aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}</span>
                                    <span className="sm:hidden">{aiGenerateMutation.isPending ? "Generating..." : "AI Generate"}</span>
                                </Button>
                            ) : (
                                <>
                                    {isEditing ? (
                                        <>
                                            <Button onClick={handleSave} variant="nebula" className="text-sm px-4 py-2">
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
                                            <Button variant="nebula-ghost" className="gap-2 text-sm px-4 py-2">
                                                <Share2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">Share</span>
                                            </Button>
                                            <Button variant="nebula-ghost" className="gap-2 text-sm px-4 py-2">
                                                <Download className="w-4 h-4" />
                                                <span className="hidden sm:inline">Export</span>
                                            </Button>
                                            <Button onClick={() => setIsEditing(true)} variant="nebula" className="text-sm px-4 py-2">
                                                <Pencil className="w-4 h-4 mr-2" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </Button>
                                            <Button onClick={handleDelete} variant="ghost" className="text-[color:var(--color-accent-red)] hover:bg-[var(--color-accent-red-glow)] p-2 transition-all duration-200">
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
            <div className="flex-1 overflow-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="p-0 w-full mx-auto box-border">
                    {!architecture && !aiGenerateMutation.isPending ? (
                        <div className="flex items-center justify-center h-full p-4 sm:p-8">
                            <div className="max-w-sm sm:max-w-md text-center px-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-[var(--color-nebula-hairline-strong)]">
                                    <Network className="w-8 h-8 sm:w-10 sm:h-10 text-[color:var(--color-nebula-fg)]" />
                                </div>
                                <h3 className="type-h3 mb-3">No Architecture Defined</h3>
                                <p className="type-body text-[color:var(--color-charcoal)] mb-4 sm:mb-6 leading-relaxed break-words">
                                    Define your system architecture with AI assistance. We&apos;ll help you create a comprehensive design including components, data flow, and infrastructure.
                                </p>
                                <Button
                                    variant="nebula-ghost"
                                    onClick={handleGenerateClick}
                                    size="lg"
                                    className="text-sm sm:text-base px-3 sm:px-4 py-2 whitespace-nowrap"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    <span className="hidden xs:inline">Generate with AI</span>
                                    <span className="xs:hidden">Generate</span>
                                </Button>
                            </div>
                        </div>
                    ) : aiGenerateMutation.isPending ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center px-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[var(--color-nebula-hairline-strong)] border-t-[var(--color-nebula-fg)] rounded-full animate-spin mx-auto mb-4" />
                                <p className="type-body text-[color:var(--color-nebula-fg)]">Generating architecture...</p>
                                <p className="type-small text-[color:var(--color-charcoal)] mt-1">This may take a moment</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 w-full h-full">
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

                            <ArchitectureTabs
                                projectId={project.id}
                                architecture={architecture}
                                isEditing={isEditing}
                                formData={formData}
                                onFormChange={(field, value) => {
                                    setFormData(prev => ({ ...prev, [field]: value }));
                                }}
                            />
                        </div>
                    )}
                </div>
                <AIGenerationModal
                    isOpen={isAIModalOpen}
                    onClose={() => {
                        setIsAIModalOpen(false);
                        aiGenerateMutation.reset();
                    }}
                    projectId={project.id}
                    type="architecture"
                    onGenerate={handleAIGenerate}
                    isGenerating={aiGenerateMutation.isPending}
                />
            </div>

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Architecture"
                description="Are you sure you want to delete this architecture documentation? This action cannot be undone and will permanently remove all architecture data from your project."
                confirmText="Delete Architecture"
                isDeleting={deleteMutation.isPending}
            />
        </div >
    );
}
