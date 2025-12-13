"use client";

import React, { useEffect, useState } from "react";
import mermaid from "mermaid";
import { Loader2, AlertTriangle, Sparkles, ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";
import CanvasViewer from "@/components/ui/CanvasViewer";

mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
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
            <div className={`flex items-center justify-center p-8 bg-white/5 rounded-lg min-h-[200px] ${className}`}>
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 bg-red-500/10 border border-red-500/20 rounded-lg min-h-[200px] ${className}`}>
                <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-red-400 font-medium mb-1">Failed to render diagram</p>
                <p className="text-xs text-red-400/70 font-mono text-center max-w-md overflow-hidden text-ellipsis mb-4">
                    {error}
                </p>

                {onFix && (
                    <button
                        onClick={handleFix}
                        disabled={isFixing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md text-sm transition-colors disabled:opacity-50"
                    >
                        {isFixing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Fixing with AI...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Fix with AI
                            </>
                        )}
                    </button>
                )}

                <pre className="mt-4 p-2 bg-black/30 rounded text-xs text-gray-400 w-full overflow-x-auto">
                    {chart}
                </pre>
            </div>
        );
    }

    return (
        <div className={`h-[500px] w-full bg-white/5 rounded-lg overflow-hidden border border-white/10 ${className}`}>
            <CanvasViewer>
                <div
                    className="mermaid-container w-full h-full flex items-center justify-center p-8"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            </CanvasViewer>
        </div>
    );
}
