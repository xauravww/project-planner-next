"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Image as ImageIcon, Wand2, Download, ExternalLink } from "lucide-react";
import { createMockup, deleteMockup } from "@/actions/crud";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function MockupsPage({ params, mockups, projectName }: { params: { id: string }; mockups: any[]; projectName: string }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dummy image generation
    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Use a placeholder service that generates deterministic images based on text
        // In a real app, this would call an AI image generation API
        const dummyImageUrl = `https://placehold.co/1024x768/1e1e1e/FFF?text=${encodeURIComponent(prompt)}`;

        await createMockup(params.id, {
            prompt,
            imageUrl: dummyImageUrl,
        });

        setIsGenerating(false);
        setIsModalOpen(false);
        setPrompt("");
        window.location.reload();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this mockup?")) {
            await deleteMockup(id);
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
                    <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Mockup
                    </Button>
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
                                <GlassCard key={mockup.id} className="group relative overflow-hidden">
                                    <div className="aspect-video bg-black/40 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={mockup.imageUrl}
                                            alt={mockup.prompt}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <a
                                                href={mockup.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                            <a
                                                href={mockup.imageUrl}
                                                download={`mockup-${mockup.id}.png`}
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(mockup.id)}
                                                className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-gray-300 line-clamp-2">{mockup.prompt}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Generated {new Date(mockup.createdAt).toLocaleDateString()}
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
        </ProjectLayout>
    );
}
