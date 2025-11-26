"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Image as ImageIcon, Wand2, Code2 } from "lucide-react";
import { createMockup, deleteMockup } from "@/actions/crud";
import { generateMockups } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function MockupsPage({ params, mockups, projectName }: { params: { id: string }; mockups: any[]; projectName: string }) {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [mockupToDelete, setMockupToDelete] = useState<string | null>(null);

    // Dummy image generation
    // Create mockup entry (generation happens in detail view)
    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);

        // Create a mockup entry with a placeholder. The actual UI generation happens in the detail view.
        // We use a generic placeholder for now.
        const placeholderUrl = `https://placehold.co/1024x768/1e1e1e/FFF?text=${encodeURIComponent("Click to Generate UI")}`;

        await createMockup(params.id, {
            prompt,
            imageUrl: placeholderUrl,
        });

        setIsGenerating(false);
        setIsModalOpen(false);
        setPrompt("");
        window.location.reload();
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generateMockups(params.id, answers);
        setIsGenerating(false);
        window.location.reload();
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMockupToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (mockupToDelete) {
            await deleteMockup(mockupToDelete);
            window.location.reload();
        }
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
                                { label: "Mockups" },
                            ]}
                        />
                        <h1 className="text-2xl font-semibold text-white mt-2">Visual Mockups</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => setIsModalOpen(true)} className="bg-white text-black hover:bg-gray-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Mockup
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
                    {mockups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                <ImageIcon className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Mockups Yet</h3>
                            <p className="text-gray-400 max-w-md mb-6">
                                Generate visual mockups for your project using AI. Describe what you want to see, and we'll create it.
                            </p>
                            <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Wand2 className="w-5 h-5 mr-2" />
                                Generate First Mockup
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockups.map((mockup) => (
                                <GlassCard
                                    key={mockup.id}
                                    className="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] p-0"
                                    onClick={() => router.push(`/projects/${params.id}/mockups/${mockup.id}`)}
                                >
                                    <div className="aspect-[4/3] bg-black/40 relative">
                                        {mockup.code ? (
                                            // Show live iframe preview if code exists
                                            <iframe
                                                title="Mockup preview"
                                                srcDoc={mockup.code}
                                                className="w-full h-full border-0 pointer-events-none"
                                                sandbox="allow-scripts allow-same-origin"
                                            />
                                        ) : mockup.imageUrl ? (
                                            // Show image if available but no code
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={mockup.imageUrl}
                                                alt="Mockup preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            // Show placeholder if neither code nor image
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <div className="text-center">
                                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">Click to generate UI</p>
                                                </div>
                                            </div>
                                        )}
                                        {/* Overlay on hover - minimal, just status and delete */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                                            {new Date(mockup.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
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
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-4 h-4 mr-2" />
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
        </ProjectLayout>
    );
}
