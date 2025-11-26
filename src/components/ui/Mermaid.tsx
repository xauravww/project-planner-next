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
            if (!chart) return;

            setLoading(true);
            setError(null);

            try {
                // Generate a unique ID for each diagram
                const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

                // Check for validity first
                try {
                    await mermaid.parse(chart);
                } catch (e) {
                    throw new Error("Invalid Mermaid syntax");
                }

                // Render
                const { svg } = await mermaid.render(id, chart);

                if (isMounted) {
                    setSvg(svg);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Mermaid render error:", err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to render diagram");
                    setLoading(false);
                }
            }
        };

        renderChart();

        return () => {
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
