"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Copy, Check, Upload, Wand2, Loader2, X } from "lucide-react";
import { updateMockup } from "@/actions/crud";

interface MockupDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    mockup: {
        id: string;
        prompt: string;
        imageUrl: string;
        code?: string;
        createdAt: Date;
    } | null;
    projectId: string;
}

export function MockupDetailModal({ isOpen, onClose, mockup, projectId }: MockupDetailModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState(mockup?.imageUrl || "");
    const [currentCode, setCurrentCode] = useState(mockup?.code || "");
    const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCopyPrompt = async () => {
        if (!mockup) return;
        await navigator.clipboard.writeText(mockup.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerateCode = async () => {
        if (!mockup) return;

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

                // Update the mockup with the generated code
                await updateMockup(mockup.id, { code: data.code });

                // Auto-generate screenshot from the HTML
                try {
                    const screenshotResponse = await fetch("/api/generate-mockup-screenshot", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            html: data.code,
                            mockupId: mockup.id
                        }),
                    });

                    const screenshotData = await screenshotResponse.json();
                    if (screenshotData.success && screenshotData.imageUrl) {
                        setCurrentImageUrl(screenshotData.imageUrl);
                        // setHasChanges(true); // This state variable is not defined in the provided code.
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

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !mockup) return;

        setIsUploading(true);
        setError(null);

        try {
            // Create FormData to upload image
            const formData = new FormData();
            formData.append("file", file);
            formData.append("mockupId", mockup.id);

            const response = await fetch("/api/upload-mockup-image", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success && data.imageUrl) {
                setCurrentImageUrl(data.imageUrl);
                await updateMockup(mockup.id, { imageUrl: data.imageUrl });
            } else {
                setError(data.error || "Failed to upload image");
            }
        } catch (err: any) {
            setError(err.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
        // Refresh the page to show updated data
        if (currentImageUrl !== mockup?.imageUrl || currentCode !== mockup?.code) {
            window.location.reload();
        }
    };

    if (!mockup) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-6xl bg-zinc-900 border-white/10 text-white h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center justify-between">
                        <span>Mockup Details</span>
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === "preview" ? "default" : "ghost"}
                                onClick={() => setActiveTab("preview")}
                                size="sm"
                            >
                                Preview
                            </Button>
                            <Button
                                variant={activeTab === "code" ? "default" : "ghost"}
                                onClick={() => setActiveTab("code")}
                                size="sm"
                            >
                                Code
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
                    {/* Prompt Section */}
                    <div className="space-y-2 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-400">Prompt</h3>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCopyPrompt}
                                className="h-8"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3 mr-2 text-green-400" />
                                        <span className="text-xs text-green-400">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3 mr-2" />
                                        <span className="text-xs">Copy</span>
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-gray-200 p-3 bg-white/5 rounded-lg border border-white/10 text-sm line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                            {mockup.prompt}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2 flex-shrink-0">
                            <span className="text-red-400">⚠</span>
                            <span className="flex-1">{error}</span>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 bg-black/40 rounded-lg overflow-hidden border border-white/10 relative min-h-0">
                        {activeTab === "preview" ? (
                            currentCode ? (
                                <iframe
                                    srcDoc={currentCode}
                                    className="w-full h-full bg-white"
                                    title="Mockup Preview"
                                    sandbox="allow-scripts"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                    <Wand2 className="w-12 h-12 text-gray-600 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-300 mb-2">No UI Generated Yet</h3>
                                    <p className="text-gray-500 max-w-sm mb-6">
                                        Generate a fully functional HTML/CSS/JS user interface based on your prompt.
                                    </p>
                                    <Button
                                        onClick={handleGenerateCode}
                                        disabled={isGenerating}
                                        size="lg"
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Generating UI...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-5 h-5 mr-2" />
                                                Generate UI
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div className="h-full overflow-auto p-4 bg-[#1e1e1e]">
                                <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                                    {currentCode || "// No code generated yet"}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-2 flex-shrink-0">
                        <p className="text-xs text-gray-500">
                            Generated on {new Date(mockup.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                className="hidden"
                            />
                            {/* Hidden upload for now as we focus on code generation, but keeping logic if needed */}
                            <Button variant="ghost" onClick={handleClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
