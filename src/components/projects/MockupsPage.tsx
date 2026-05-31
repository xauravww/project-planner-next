"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Image as ImageIcon, Wand2, Code2, Sparkles } from "lucide-react";
import { createMockup, deleteMockup, deleteAllMockups } from "@/actions/crud";
import { generateMockups, generateSingleMockup, generateMockupImage, saveProjectContext } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import ProjectLayout from "@/components/projects/ProjectLayout";
import { toast } from "sonner";
import { AestheticLoader } from "@/components/ui/AestheticLoader";

export default function MockupsPage({ params, mockups, projectName }: { params: { id: string }; mockups: any[]; projectName: string }) {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
    const [mockupToDelete, setMockupToDelete] = useState<string | null>(null);

    const handleGenerateImage = async (mockupId: string, e: React.MouseEvent) => {
        console.log("handleGenerateImage clicked for mockup:", mockupId);
        e.stopPropagation();
        toast.info("Generating image...");
        const result = await generateMockupImage(mockupId);
        console.log("generateMockupImage result:", result);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Image generated!");
            router.refresh();
        }
    };

    // Manual generation
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Please enter a mockup description");
            return;
        }

        setIsGenerating(true);
        toast.info("Generating mockup...");

        try {
            const result = await generateSingleMockup(params.id, prompt);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Mockup generated successfully!");
                setIsModalOpen(false);
                setPrompt("");
                router.refresh();
            }
        } catch (error) {
            console.error("Manual mockup generation error:", error);
            toast.error("Failed to generate mockup. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        setIsAIModalOpen(false);
        toast.info("AI is analyzing your requirements...");

        try {
            // Save context for each answer
            for (const answer of answers) {
                await saveProjectContext(
                    params.id,
                    answer.question,
                    answer.question,
                    answer.selected,
                    "mockups"
                );
            }

            const result = await generateMockups(params.id, answers);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Mockups generated! Click 'Generate Image' on each card to create visuals.");
                router.refresh();
            }
        } catch (error) {
            console.error("AI mockup generation error:", error);
            toast.error("Failed to generate mockups. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMockupToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!mockupToDelete) return;

        try {
            await deleteMockup(mockupToDelete);
            toast.success("Mockup deleted");
            setIsDeleteDialogOpen(false);
            setMockupToDelete(null);
            router.refresh();
        } catch (error) {
            console.error("Delete mockup error:", error);
            toast.error("Failed to delete mockup");
        }
    };

    const handleDeleteAllConfirm = async () => {
        await deleteAllMockups(params.id);
        setIsDeleteAllDialogOpen(false);
        router.refresh();
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col relative">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
                <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-[128px] -z-10" />

                {/* Header */}
                <div className="border-b border-white/10 px-4 lg:px-6 py-4 lg:py-6 bg-black/40 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-4 justify-center lg:justify-start">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                                </div>
                                <div className="text-center lg:text-left">
                                    <h1 className="text-xl lg:text-2xl font-bold text-white">Visual Mockups</h1>
                                    <p className="text-sm text-muted-foreground mt-0.5">UI designs & interface previews</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                                {mockups.length > 0 && (
                                    <Button
                                        onClick={() => setIsDeleteAllDialogOpen(true)}
                                        variant="ghost"
                                        className="text-red-400 hover:text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20 border border-transparent hover:border-red-500/40 transition-all duration-200 text-sm px-4 py-2"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Delete All</span>
                                        <span className="sm:hidden">Delete</span>
                                    </Button>
                                )}
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    variant="glass"
                                    className="gap-2 text-sm px-4 py-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Mockup</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                                <Button
                                    variant="glass"
                                    onClick={() => setIsAIModalOpen(true)}
                                    disabled={isGenerating}
                                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 hover:border-indigo-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] text-sm px-4 py-2"
                                >
                                    <Sparkles className="w-4 h-4 mr-2 text-indigo-400" />
                                    <span className="hidden sm:inline">{isGenerating ? "Generating..." : "Generate with AI"}</span>
                                    <span className="sm:hidden">{isGenerating ? "Generating..." : "AI Generate"}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <div className="p-0 w-full mx-auto box-border">
                        {mockups.length === 0 ? (
                            <div className="flex items-center justify-center h-full p-4 sm:p-8">
                                <div className="max-w-sm sm:max-w-md text-center px-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-purple-500/20">
                                        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No Mockups Defined</h3>
                                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed break-words">
                                        Create visual mockups for your project with AI assistance. We&apos;ll help you generate high-fidelity UI designs and interface previews.
                                    </p>
                                    <Button
                                        variant="glass"
                                        onClick={() => setIsAIModalOpen(true)}
                                        size="lg"
                                        className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 hover:border-indigo-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] text-sm sm:text-base px-3 sm:px-4 py-2 whitespace-nowrap"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2 text-indigo-400" />
                                        <span className="hidden xs:inline">Generate with AI</span>
                                        <span className="xs:hidden">Generate</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {mockups.map((mockup) => (
                                        <GlassCard
                                            key={mockup.id}
                                            className="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] p-0"
                                            onClick={() => router.push(`/projects/${params.id}/mockups/${mockup.id}`)}
                                        >
                                            <div className="aspect-[4/3] bg-black/40 relative">
                                                {mockup.code ? (
                                                    <iframe
                                                        title="Mockup preview"
                                                        srcDoc={mockup.code}
                                                        className="w-full h-full border-0 pointer-events-none"
                                                        sandbox="allow-scripts allow-same-origin"
                                                    />
                                                ) : mockup.imageUrl && mockup.imageUrl !== "PENDING" ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={mockup.imageUrl}
                                                        alt="Mockup preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 p-4 text-center">
                                                        <ImageIcon className="w-8 h-8 text-indigo-400 mb-3 opacity-80" />
                                                        <p className="text-xs text-gray-400 mb-4 line-clamp-2 px-2">{mockup.prompt}</p>
                                                        <Button
                                                            size="sm"
                                                            variant="glass"
                                                            onClick={(e) => handleGenerateImage(mockup.id, e)}
                                                            className="border-indigo-500/30 hover:bg-indigo-500/20 relative z-20"
                                                        >
                                                            <Wand2 className="w-3 h-3 mr-2" />
                                                            Generate Image
                                                        </Button>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    {mockup.code && (
                                                        <div className="absolute top-4 left-4 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
                                                            <Code2 className="w-3 h-3" />
                                                            <span>UI Generated</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDeleteClick(mockup.id, e)}
                                                        className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 transition-colors backdrop-blur-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-black/20">
                                                <p className="text-xs text-gray-400">
                                                    {new Date(mockup.createdAt).toISOString().split('T')[0]}
                                                </p>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Generation Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <GlassCard className="w-full max-w-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Generate Mockup</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">
                                        Describe the screen or interface
                                    </label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="E.g., A dark mode dashboard with sales charts and a sidebar navigation..."
                                        className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isGenerating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={!prompt || isGenerating}
                                        className="bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-all"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Wand2 className="w-4 h-4 mr-2 animate-spin text-white/70" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-4 h-4 mr-2 text-white/90" />
                                                Generate
                                            </>
                                        )}
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
                type="mockups"
                onGenerate={handleAIGenerate}
            />
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setMockupToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Mockup"
                description="Are you sure you want to delete this mockup? This action cannot be undone."
                confirmText="Delete"
                intent="danger"
            />
            <ConfirmDialog
                isOpen={isDeleteAllDialogOpen}
                onClose={() => setIsDeleteAllDialogOpen(false)}
                onConfirm={handleDeleteAllConfirm}
                title="Delete All Mockups"
                description="Are you sure you want to delete ALL mockups in this project? This action acts on ALL mockups and cannot be undone."
                confirmText="Delete All"
                intent="danger"
            />

            {/* Global Loader Overlay */}
            {isGenerating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative">
                        <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                        <div className="relative bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                            <AestheticLoader message="Generating your mockups..." />
                        </div>
                    </div>
                </div>
            )}
        </ProjectLayout>
    );
}
