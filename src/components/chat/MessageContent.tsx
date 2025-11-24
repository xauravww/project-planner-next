"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { Button } from "@/components/ui/Button";

// Configure Mermaid with no max width constraints
mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "inherit",
    flowchart: {
        useMaxWidth: false, // Allow natural expansion
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
    },
    sequence: {
        useMaxWidth: false,
    },
    gantt: {
        useMaxWidth: false,
    },
});

const MermaidDiagram = ({ code }: { code: string }) => {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const elementId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                setError(null);
                const { svg } = await mermaid.render(elementId.current, code);
                setSvg(svg);
            } catch (err: any) {
                console.error("Mermaid render error:", err);
                setError(err.message || "Failed to render diagram");
            }
        };

        renderDiagram();
    }, [code]);

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm mb-2">Failed to render diagram</p>
                <pre className="text-xs text-red-300/70 overflow-x-auto whitespace-pre-wrap">
                    {error}
                </pre>
                <div className="mt-3 flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-300"
                        onClick={() => window.open(`https://mermaid.live/edit#base64:${btoa(code)}`, '_blank')}
                    >
                        Open in Mermaid Live
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="mermaid-container my-4 overflow-visible"
            style={{ maxWidth: 'none', width: 'max-content' }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

export function MessageContent({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isMermaid = match && match[1] === "mermaid";

                    if (!inline && isMermaid) {
                        return <MermaidDiagram code={String(children).replace(/\n$/, "")} />;
                    }

                    return !inline && match ? (
                        <div className="relative group my-4">
                            <div className="absolute -top-3 right-2 px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                {match[1]}
                            </div>
                            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto border border-white/10">
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </pre>
                        </div>
                    ) : (
                        <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-pink-300" {...props}>
                            {children}
                        </code>
                    );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-400">
                        {children}
                    </blockquote>
                ),
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {children}
                    </a>
                ),
                table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                        <table className="min-w-full border-collapse border border-white/10 text-sm">
                            {children}
                        </table>
                    </div>
                ),
                thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => <tr className="border-b border-white/10">{children}</tr>,
                th: ({ children }) => <th className="p-2 text-left font-semibold text-gray-200">{children}</th>,
                td: ({ children }) => <td className="p-2 text-gray-300">{children}</td>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
