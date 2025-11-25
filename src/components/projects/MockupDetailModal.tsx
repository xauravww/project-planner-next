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
        createdAt: Date;
    } | null;
    projectId: string;
}

export function MockupDetailModal({ isOpen, onClose, mockup, projectId }: MockupDetailModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState(mockup?.imageUrl || "");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCopyPrompt = async () => {
        if (!mockup) return;
        await navigator.clipboard.writeText(mockup.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerate = async () => {
        if (!mockup) return;

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch("/api/generate-mockup-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: mockup.prompt })
            });

            const data = await response.json();

            if (data.success && data.imageUrl) {
                setCurrentImageUrl(data.imageUrl);
                // Update the mockup in database
                await updateMockup(mockup.id, { imageUrl: data.imageUrl });
            } else {
                setError(data.error || "Failed to generate image");
            }
        } catch (err: any) {
            setError(err.message || "Failed to generate image");
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
        // Refresh the page to show updated image
        if (currentImageUrl !== mockup?.imageUrl) {
            window.location.reload();
        }
    };

    if (!mockup) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-4xl bg-zinc-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Mockup Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Prompt Section */}
                    <div className="space-y-2">
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
                        <p className="text-gray-200 p-4 bg-white/5 rounded-lg border border-white/10">
                            {mockup.prompt}
                        </p>
                    </div>

                    {/* Image Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-400">Generated Image</h3>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
                                <span className="text-red-400">⚠</span>
                                <span className="flex-1">{error}</span>
                                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={currentImageUrl}
                                alt={mockup.prompt}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || isUploading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Generate
                                    </>
                                )}
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                className="hidden"
                            />

                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isGenerating || isUploading}
                                variant="outline"
                                className="flex-1"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Image
                                    </>
                                )}
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 text-center">
                            Generated on {new Date(mockup.createdAt).toLocaleDateString()} at{" "}
                            {new Date(mockup.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                    <Button variant="ghost" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
