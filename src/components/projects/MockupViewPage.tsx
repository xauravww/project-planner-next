"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Wand2, Code, Eye, Settings2, Copy, Check } from "lucide-react";
import { updateMockup } from "@/actions/crud";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

type Tab = "preview" | "code" | "settings";

export default function MockupViewPage({
    params,
    mockup,
    projectName,
}: {
    params: { id: string; mockupId: string };
    mockup: any;
    projectName: string;
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("preview");
    const [currentCode, setCurrentCode] = useState(mockup.code || "");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerateCode = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch("/api/generate-mockup-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: mockup.prompt }),
            });

            const data = await response.json();

            if (data.success && data.code) {
                setCurrentCode(data.code);
                await updateMockup(mockup.id, { code: data.code });

                // Auto-generate screenshot from the HTML
                try {
                    // Dynamically import html2canvas
                    const html2canvas = (await import("html2canvas")).default;

                    // Create a temporary container to render HTML
                    const container = document.createElement('div');
                    container.style.position = 'absolute';
                    container.style.left = '-9999px';
                    container.style.width = '1200px';
                    container.innerHTML = data.code;
                    document.body.appendChild(container);

                    // Wait a bit for content to render
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Capture screenshot
                    const canvas = await html2canvas(container, {
                        width: 1200,
                        height: 800,
                        scale: 1,
                        logging: false,
                    });

                    // Convert to base64
                    const imageData = canvas.toDataURL('image/png');

                    // Remove temp container
                    document.body.removeChild(container);

                    // Send to server
                    const screenshotResponse = await fetch("/api/generate-mockup-screenshot", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            imageData,
                            mockupId: mockup.id
                        }),
                    });

                    const screenshotData = await screenshotResponse.json();
                    if (screenshotData.success && screenshotData.imageUrl) {
                        // Reload page to show new screenshot in grid
                        setTimeout(() => window.location.reload(), 1000);
                    }
                } catch (screenshotError) {
                    console.error('Failed to generate screenshot:', screenshotError);
                    // Not critical, just log it
                }
            } else {
                setError(data.error || "Failed to generate code");
            }
        } catch (err: any) {
            setError(err.message || "Failed to generate code");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyCode = () => {
        if (currentCode) {
            navigator.clipboard.writeText(currentCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const breadcrumbItems = [
        { label: projectName, href: `/projects/${params.id}` },
        { label: "Mockups", href: `/projects/${params.id}/mockups` },
        { label: "View" },
    ];

    const tabs = [
        { id: "preview" as Tab, label: "Preview", icon: Eye },
        { id: "code" as Tab, label: "Code", icon: Code },
        { id: "settings" as Tab, label: "Settings", icon: Settings2 },
    ];

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-start">
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${activeTab === tab.id
                                    ? "text-white"
                                    : "text-gray-400 hover:text-gray-300"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="min-h-[600px]">
                    {activeTab === "preview" && (
                        <div className="space-y-4">
                            {isGenerating ? (
                                <GlassCard className="flex flex-col items-center justify-center py-16">
                                    <LoadingAnimation />
                                </GlassCard>
                            ) : !currentCode ? (
                                <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="flex flex-col items-center gap-4 max-w-md">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Wand2 className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">No UI Generated Yet</h3>
                                        <p className="text-gray-400">
                                            Generate a fully functional HTML/CSS/JS user interface based on your prompt.
                                        </p>
                                        <Button
                                            onClick={handleGenerateCode}
                                            disabled={isGenerating}
                                            className="mt-4 bg-blue-500 hover:bg-blue-600"
                                        >
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Generate UI
                                        </Button>
                                        {error && (
                                            <p className="text-red-400 text-sm mt-2">{error}</p>
                                        )}
                                    </div>
                                </GlassCard>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                                        <Button
                                            onClick={handleGenerateCode}
                                            disabled={isGenerating}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Regenerate
                                        </Button>
                                    </div>
                                    <div className="bg-white rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl">
                                        <iframe
                                            title="Mockup Preview"
                                            srcDoc={currentCode}
                                            className="w-full h-[800px] border-0"
                                            sandbox="allow-scripts allow-same-origin"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "code" && (
                        <div className="space-y-4">
                            {currentCode ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-white">Generated Code</h3>
                                        <Button
                                            onClick={handleCopyCode}
                                            variant="outline"
                                            size="sm"
                                        >
                                            {isCopied ? (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy Code
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 overflow-x-auto">
                                        <pre className="text-sm text-gray-300 font-mono">
                                            <code>{currentCode}</code>
                                        </pre>
                                    </div>
                                </>
                            ) : (
                                <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
                                    <p className="text-gray-400">
                                        No code generated yet. Click "Generate UI" in the Preview tab.
                                    </p>
                                </GlassCard>
                            )}
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <GlassCard className="space-y-6 p-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Prompt
                                </label>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {mockup.prompt}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Created
                                </label>
                                <p className="text-gray-400 text-sm">
                                    {new Date(mockup.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Last Updated
                                </label>
                                <p className="text-gray-400 text-sm">
                                    {new Date(mockup.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </ProjectLayout>
    );
}
