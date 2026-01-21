"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Image as ImageIcon, Wand2, Code2 } from "lucide-react";
import { createMockup, deleteMockup } from "@/actions/crud";
import { generateMockups, generateSingleMockup, generateMockupImage } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { toast } from "sonner"; // Assuming toast is available or I should add it

export default function MockupsPage({ params, mockups, projectName }: { params: { id: string }; mockups: any[]; projectName: string }) {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [mockupToDelete, setMockupToDelete] = useState<string | null>(null);

    const handleGenerateImage = async (mockupId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toast.info("Generating image...");
        const result = await generateMockupImage(mockupId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Image generated!");
            router.refresh();
        }
    };

    // ... params ...

    // Manual generation
    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);

        const result = await generateSingleMockup(params.id, prompt);

        if (result.error) {
            toast.error(result.error); // Assuming toast exists, otherwise console.error or alert
        } else {
            toast.success("Mockup generated successfully");
            setIsModalOpen(false);
            setPrompt("");
            // window.location.reload(); // Revalidation should handle it, but reload is safe if revalidation is slow
            router.refresh();
        }

        setIsGenerating(false);
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
            <div>
                <div className="sticky top-0 z-10 border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/60 backdrop-blur-xl">
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
                            variant="glass"
                            onClick={() => setIsAIModalOpen(true)}
                            disabled={isGenerating}
                            className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 hover:border-indigo-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                        >
                            <Wand2 className="w-4 h-4 mr-2 text-indigo-400" />
                            {isGenerating ? "Generating..." : "Generate with AI"}
                        </Button>
                    </div>
                </div>

                <div className="p-6">
                    {mockups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm group-hover:border-white/20 transition-colors">
                                    <ImageIcon className="w-10 h-10 text-gray-400 group-hover:text-white transition-colors duration-300" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No Mockups Yet</h3>
                            <p className="text-gray-400 max-w-md mb-8 text-lg">
                                Transform your ideas into visuals. Use our AI to generate high-fidelity UI mockups for your project instantly.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    variant="glass"
                                    onClick={() => setIsAIModalOpen(true)}
                                    size="lg"
                                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 hover:border-indigo-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.15)] group"
                                >
                                    <Wand2 className="w-5 h-5 mr-2 text-indigo-400 group-hover:animate-pulse" />
                                    Generate with AI
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(true)}
                                    size="lg"
                                    className="border-white/10 hover:bg-white/5 text-gray-300 hover:text-white"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Manual Entry
                                </Button>
                            </div>
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
                                        ) : mockup.imageUrl && mockup.imageUrl !== "PENDING" ? (
                                            // Show image if available and not pending
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={mockup.imageUrl}
                                                alt="Mockup preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            // Show placeholder or Generate Button if pending
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
                                        {/* Overlay on hover - minimal, just status and delete */}
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
        </ProjectLayout>
    );
}
