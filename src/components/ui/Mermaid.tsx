"use client";

import React, { useEffect, useState } from "react";
import mermaid from "mermaid";
import { Loader2, AlertTriangle, Sparkles, ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";
import CanvasViewer from "@/components/ui/CanvasViewer";

mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
        // Void/System Dark Theme
        background: "#09090b", // zinc-950
        primaryColor: "#3b82f6", // blue-500
        primaryTextColor: "#e4e4e7", // zinc-200
        primaryBorderColor: "#3f3f46", // zinc-700
        lineColor: "#52525b", // zinc-600
        secondaryColor: "#8b5cf6", // violet-500
        tertiaryColor: "#10b981", // emerald-500

        // Dark backgrounds with light text
        textColor: "#e4e4e7",
        mainBkg: "#09090b",
        secondBkg: "#18181b", // zinc-900
        tertiaryBkg: "#27272a", // zinc-800
        nodeBorder: "#3f3f46",
        clusterBkg: "#18181b",
        clusterBorder: "#3f3f46",
        titleColor: "#fafafa",
        edgeLabelBackground: "#18181b",
        gridColor: "#27272a",

        // Text elements
        nodeTextColor: "#e4e4e7",
        edgeTextColor: "#a1a1aa", // zinc-400
        actorTextColor: "#e4e4e7",
        noteTextColor: "#a1a1aa",
        labelTextColor: "#e4e4e7",
        signalTextColor: "#e4e4e7",
        stateTextColor: "#e4e4e7",
        stateLabelColor: "#e4e4e7",
        classTextColor: "#e4e4e7",
        attributeTextColor: "#e4e4e7",

        // Element backgrounds
        actorBkg: "#18181b",
        actorBorder: "#3f3f46",
        actorLineColor: "#a1a1aa",
        signalColor: "#a1a1aa",
        stateBkg: "#18181b",
        stateBorder: "#3f3f46",
        attributeBkgColorMain: "#18181b",
        fillType0: "#18181b",
        fillType1: "#18181b",
        fillType2: "#27272a",
    },
    securityLevel: "loose",
    fontFamily: "inherit",
});

interface MermaidProps {
    chart: string;
    className?: string;
    onFix?: (error: string) => void;
}

export default function Mermaid({ chart, className = "", onFix }: MermaidProps) {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFixing, setIsFixing] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const renderChart = async () => {
            console.log("[Mermaid] Starting render for chart:", chart.substring(0, 100) + "...");

            if (!chart) {
                console.log("[Mermaid] No chart provided, skipping render");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Check if mermaid is available
                if (typeof mermaid === 'undefined') {
                    throw new Error("Mermaid library is not loaded");
                }
                console.log("[Mermaid] Mermaid library available, version:", (mermaid as any).version || "unknown");

                // Generate a unique ID for each diagram
                const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
                console.log("[Mermaid] Generated ID:", id);

                // Check for validity first
                console.log("[Mermaid] Parsing chart syntax...");
                try {
                    await mermaid.parse(chart);
                    console.log("[Mermaid] Chart syntax is valid");
                } catch (parseErr) {
                    console.error("[Mermaid] Parse error:", parseErr);
                    throw new Error(`Invalid Mermaid syntax: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
                }

                // Render
                console.log("[Mermaid] Rendering chart...");
                const { svg } = await mermaid.render(id, chart);
                console.log("[Mermaid] Render successful, SVG length:", svg.length);

                if (isMounted) {
                    setSvg(svg);
                    setLoading(false);
                    console.log("[Mermaid] State updated successfully");
                } else {
                    console.log("[Mermaid] Component unmounted, skipping state update");
                }
            } catch (err) {
                console.error("[Mermaid] Render error:", err);
                console.error("[Mermaid] Error details:", {
                    message: err instanceof Error ? err.message : String(err),
                    stack: err instanceof Error ? err.stack : undefined,
                    chart: chart.substring(0, 200) + "..."
                });
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to render diagram");
                    setLoading(false);
                }
            }
        };

        renderChart();

        return () => {
            console.log("[Mermaid] Component unmounting, cleaning up");
            isMounted = false;
        };
    }, [chart]);

    const handleFix = async () => {
        if (!onFix || !error) return;
        setIsFixing(true);
        try {
            await onFix(error);
        } finally {
            setIsFixing(false);
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg min-h-[200px] border border-gray-200 ${className}`}>
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 bg-black/40 border border-red-500/20 rounded-lg min-h-[200px] backdrop-blur-sm ${className}`}>
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-red-400 font-medium mb-2">Failed to render diagram</p>
                <p className="text-xs text-red-400/70 font-mono text-center max-w-md overflow-hidden text-ellipsis mb-6">
                    {error}
                </p>

                {onFix && (
                    <button
                        onClick={handleFix}
                        disabled={isFixing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-all border border-red-500/20 hover:border-red-500/40 disabled:opacity-50"
                    >
                        {isFixing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Fixing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Fix with AI
                            </>
                        )}
                    </button>
                )}

                <div className="mt-6 w-full max-w-2xl bg-black/50 rounded-lg border border-white/5 overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-white/5 bg-white/5 text-[10px] text-gray-400 font-mono">
                        Source
                    </div>
                    <pre className="p-3 text-[10px] text-gray-400 overflow-x-auto font-mono custom-scrollbar">
                        {chart}
                    </pre>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-[300px] sm:h-[400px] lg:h-[500px] w-full bg-black/20 rounded-xl overflow-hidden border border-white/5 backdrop-blur-sm ${className}`}>
            <CanvasViewer>
                <div
                    className="mermaid-container w-full h-full flex items-center justify-center p-2 sm:p-4 lg:p-8 overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            </CanvasViewer>
        </div>
    );
}
