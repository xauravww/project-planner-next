"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { Button } from "@/components/ui/Button";
import { Copy, Check, Wand2, RefreshCw } from "lucide-react";

// Configure Mermaid with custom dark theme and flexible sizing
mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: {
        darkMode: true,
        primaryColor: "#3b82f6",
        primaryTextColor: "#fff",
        primaryBorderColor: "#60a5fa",
        lineColor: "#94a3b8",
        secondaryColor: "#8b5cf6",
        tertiaryColor: "#10b981",
        background: "#1e293b",
        mainBkg: "#1e293b",
        secondBkg: "#0f172a",
        tertiaryBkg: "#334155",
        nodeBorder: "#60a5fa",
        clusterBkg: "#334155",
        clusterBorder: "#60a5fa",
        titleColor: "#fff",
        edgeLabelBackground: "#1e293b",
        nodeTextColor: "#fff",
        fontSize: "16px",
    },
    securityLevel: "loose",
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: "basis",
        padding: 30,
        nodeSpacing: 80,
        rankSpacing: 80,
        diagramPadding: 20,
    },
    sequence: {
        useMaxWidth: false,
        diagramMarginX: 20,
        diagramMarginY: 20,
        actorMargin: 80,
        boxMargin: 20,
        boxTextMargin: 10,
        noteMargin: 20,
        messageMargin: 50,
    },
    gantt: {
        useMaxWidth: false,
        leftPadding: 100,
        gridLineStartPadding: 100,
        fontSize: 14,
        sectionFontSize: 16,
    },
});

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-4">
            <div className="absolute -top-3 right-2 flex items-center gap-2 z-10">
                <span className="px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {language}
                </span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-7 px-2 bg-gray-800 hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 mr-1 text-green-400" />
                            <span className="text-xs text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3 mr-1" />
                            <span className="text-xs">Copy</span>
                        </>
                    )}
                </Button>
            </div>
            <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto border border-white/10">
                <code className={`language-${language} text-sm`}>{code}</code>
            </pre>
        </div>
    );
};

const MermaidDiagram = ({ code }: { code: string }) => {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isFixing, setIsFixing] = useState(false);
    const [currentCode, setCurrentCode] = useState(code);
    const elementId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                setError(null);
                const { svg } = await mermaid.render(elementId.current, currentCode);
                setSvg(svg);
            } catch (err: any) {
                console.error("Mermaid render error:", err);
                setError(err.message || "Failed to render diagram");
            }
        };

        renderDiagram();
    }, [currentCode]);

    const handleFixWithAI = async () => {
        setIsFixing(true);
        try {
            const response = await fetch("/api/fix-mermaid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ diagram: currentCode, error }),
            });

            if (!response.ok) {
                throw new Error("Failed to fix diagram");
            }

            const { fixedDiagram } = await response.json();
            setCurrentCode(fixedDiagram);
        } catch (err: any) {
            console.error("Failed to fix diagram:", err);
            alert("Failed to fix diagram. Please try editing manually.");
        } finally {
            setIsFixing(false);
        }
    };

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg my-4">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400">⚠</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-red-400 font-medium mb-1">Failed to render diagram</p>
                        <pre className="text-xs text-red-300/70 overflow-x-auto whitespace-pre-wrap font-mono bg-black/20 p-3 rounded">
                            {error}
                        </pre>
                    </div>
                </div>
                <div className="flex gap-2 ml-11">
                    <Button
                        size="sm"
                        onClick={handleFixWithAI}
                        disabled={isFixing}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isFixing ? (
                            <>
                                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                Fixing...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-3 h-3 mr-2" />
                                Fix with AI
                            </>
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-300"
                        onClick={() => window.open(`https://mermaid.live/edit#base64:${btoa(currentCode)}`, "_blank")}
                    >
                        Open in Mermaid Live
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-6 flex justify-center">
            <div
                className="mermaid-container inline-block p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-white/10"
                style={{ maxWidth: "none", width: "max-content" }}
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
};

export function MessageContent({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";
                    const code = String(children).replace(/\n$/, "");

                    if (!inline && language === "mermaid") {
                        return <MermaidDiagram code={code} />;
                    }

                    if (!inline && match) {
                        return <CodeBlock code={code} language={language} />;
                    }

                    return (
                        <code className="bg-blue-500/10 px-1.5 py-0.5 rounded text-sm font-mono text-blue-300 border border-blue-500/20" {...props}>
                            {children}
                        </code>
                    );
                },
                p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-gray-200">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-200">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-200">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-8 text-white border-b border-white/10 pb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-6 text-white">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-5 text-white">{children}</h3>,
                h4: ({ children }) => <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-100">{children}</h4>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 bg-blue-500/5 pl-4 py-2 my-4 text-gray-300 italic rounded-r">
                        {children}
                    </blockquote>
                ),
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                        {children}
                    </a>
                ),
                table: ({ children }) => (
                    <div className="overflow-x-auto my-6 rounded-lg border border-white/10">
                        <table className="min-w-full border-collapse text-sm">
                            {children}
                        </table>
                    </div>
                ),
                thead: ({ children }) => <thead className="bg-white/5 border-b border-white/10">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-white/5">{children}</tbody>,
                tr: ({ children }) => <tr className="hover:bg-white/5 transition-colors">{children}</tr>,
                th: ({ children }) => <th className="p-3 text-left font-semibold text-gray-200 border-r border-white/5 last:border-r-0">{children}</th>,
                td: ({ children }) => <td className="p-3 text-gray-300 border-r border-white/5 last:border-r-0">{children}</td>,
                hr: () => <hr className="my-6 border-white/10" />,
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
