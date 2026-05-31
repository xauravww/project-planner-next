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

type Tab = "preview" | "code" | "detail";

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
        { id: "detail" as Tab, label: "Detail", icon: Settings2 },
    ];

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-start">
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-[var(--color-nebula-hairline-strong)]">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${activeTab === tab.id
                                    ? "text-[color:var(--color-nebula-fg)]"
                                    : "text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)]"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-nebula-fg)]" />
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
                                        <div className="w-16 h-16 rounded-full bg-[var(--color-nebula-surface)] flex items-center justify-center">
                                            <Wand2 className="w-8 h-8 text-[color:var(--color-nebula-fg)]" />
                                        </div>
                                        <h3 className="type-h3">No UI Generated Yet</h3>
                                        <p className="type-body text-[color:var(--color-charcoal)]">
                                            Generate a fully functional HTML/CSS/JS user interface based on your prompt.
                                        </p>
                                        <Button
                                            variant="nebula-ghost"
                                            onClick={handleGenerateCode}
                                            disabled={isGenerating}
                                            className="mt-4"
                                        >
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Generate UI
                                        </Button>
                                        {error && (
                                            <p className="type-small text-[color:var(--color-accent-red)] mt-2">{error}</p>
                                        )}
                                    </div>
                                </GlassCard>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="type-h4">Live Preview</h3>
                                        <Button
                                            onClick={handleGenerateCode}
                                            disabled={isGenerating}
                                            variant="nebula-ghost"
                                            size="sm"
                                        >
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Regenerate
                                        </Button>
                                    </div>
                                    <div className="bg-white rounded-[var(--r-lg)] border-2 border-[var(--color-nebula-hairline-strong)] overflow-hidden">
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
                                        <h3 className="type-h4">Generated Code</h3>
                                        <Button
                                            onClick={handleCopyCode}
                                            variant="nebula-ghost"
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
                                    <div className="bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] border border-[var(--color-nebula-hairline-strong)] p-6 overflow-x-auto">
                                        <pre className="text-mono text-sm text-[color:var(--color-charcoal)]">
                                            <code>{currentCode}</code>
                                        </pre>
                                    </div>
                                </>
                            ) : (
                                <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
                                    <p className="type-body text-[color:var(--color-charcoal)]">
                                        No code generated yet. Click &quot;Generate UI&quot; in the Preview tab.
                                    </p>
                                </GlassCard>
                            )}
                        </div>
                    )}

                    {activeTab === "detail" && (
                        <GlassCard className="space-y-8 p-6">
                            <div>
                                <h3 className="type-h4 mb-4">Design Mockup</h3>
                                {mockup.imageUrl && mockup.imageUrl !== "PENDING" ? (
                                    <div className="rounded-[var(--r-lg)] overflow-hidden border border-[var(--color-nebula-hairline-strong)]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={mockup.imageUrl} alt="AI Generated Mockup" className="w-full h-auto max-h-[600px] object-contain bg-[var(--color-nebula-bg)]" />
                                    </div>
                                ) : (
                                    <div className="p-12 border border-dashed border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-lg)] bg-[var(--color-nebula-surface)] text-center text-[color:var(--color-charcoal)]">
                                        <p>No image generated for this mockup.</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--color-nebula-hairline-strong)]">
                                <div className="md:col-span-2">
                                    <label className="block type-small text-[color:var(--color-charcoal)] mb-2">
                                        Prompt
                                    </label>
                                    <div className="bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] p-4">
                                        <p className="type-small text-[color:var(--color-charcoal)]">
                                            {mockup.prompt}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block type-small text-[color:var(--color-charcoal)] mb-2">
                                        Created
                                    </label>
                                    <p className="type-small text-[color:var(--color-charcoal)]">
                                        {new Date(mockup.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="block type-small text-[color:var(--color-charcoal)] mb-2">
                                        Last Updated
                                    </label>
                                    <p className="type-small text-[color:var(--color-charcoal)]">
                                        {new Date(mockup.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </ProjectLayout >
    );
}
