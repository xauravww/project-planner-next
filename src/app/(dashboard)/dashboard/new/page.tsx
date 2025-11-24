"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createProjectWithAI } from "@/actions/project";
import { useRouter } from "next/navigation";
// Removed: import { useChat } from "ai/react";
import { MessageContent } from "@/components/chat/MessageContent";

export default function NewProjectPage() {
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    // Manual Chat Implementation
    const [messages, setMessages] = useState<any[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hi! I'm your AI planning assistant. Tell me about your project idea, and I'll help you structure it. What are you building?",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [localInput, setLocalInput] = useState("");

    const append = async (message: { role: string; content: string }) => {
        const userMessage = { id: Date.now().toString(), ...message };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: "" };

            setMessages((prev) => [...prev, assistantMessage]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const text = decoder.decode(value, { stream: true });
                    assistantMessage.content += text;
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { ...assistantMessage };
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            alert("Failed to get response from AI.");
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        "E-commerce platform",
        "Social media app",
        "Project management tool",
        "Blog platform",
    ];

    const handleLocalSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!localInput.trim()) return;

        await append({ role: "user", content: localInput });
        setLocalInput("");
    };

    const handleQuickPrompt = (prompt: string) => {
        append({ role: "user", content: prompt });
    };

    const extractProjectInfo = () => {
        // Extract project name and description from conversation
        const lastUserMessage = messages.filter((m) => m.role === "user").pop();
        const lastAIMessage = messages.filter((m) => m.role === "assistant").pop();

        if (lastUserMessage) {
            // Use last user message as project name
            const name = lastUserMessage.content.slice(0, 100);
            const description = lastAIMessage?.content.slice(0, 500) || name;
            return { name, description };
        }

        return { name: "New Project", description: "AI-generated project" };
    };

    const handleCreateProject = async () => {
        setIsCreating(true);
        const { name, description } = extractProjectInfo();

        const result = await createProjectWithAI(
            name,
            description,
            messages.map((m) => ({ role: m.role as any, content: m.content }))
        );

        if (result.success && result.projectId) {
            router.push(`/projects/${result.projectId}`);
        } else {
            alert("Failed to create project");
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Create New Project with AI
                </h1>
                <p className="text-muted-foreground">
                    Describe your project idea and let AI help you plan it
                </p>
            </div>

            {/* Chat Container */}
            <GlassCard className="p-6 min-h-[500px] flex flex-col">
                {/* Messages */}
                <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[400px]">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                    : "bg-white/10 text-gray-200"
                                    }`}
                            >
                                {msg.role === "assistant" && (
                                    <Sparkles className="w-4 h-4 inline mr-2 text-yellow-400" />
                                )}
                                {msg.role === "user" ? (
                                    <span className="whitespace-pre-wrap">{msg.content}</span>
                                ) : (
                                    <MessageContent content={msg.content} />
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0ms" }}
                                    />
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "150ms" }}
                                    />
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "300ms" }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Prompts (only show initially) */}
                {messages.length === 1 && (
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Quick starts:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickPrompt(prompt)}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleLocalSubmit} className="flex gap-2">
                    <Input
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                        placeholder="Describe your project idea..."
                        className="flex-1"
                        disabled={isLoading === true}
                    />
                    <Button
                        type="submit"
                        disabled={(isLoading === true) || !localInput.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
                {/* Debug Info */}
                <div className="text-xs text-gray-500 mt-2">
                    Debug: Loading={String(isLoading)}, Input="{localInput}", Valid={String(!(!localInput.trim()))}, Append={String(!!append)}
                </div>
            </GlassCard>

            {/* Create Project Button */}
            {messages.length > 2 && (
                <Button
                    onClick={handleCreateProject}
                    disabled={isCreating}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                >
                    {isCreating ? "Creating Project..." : "Create Project"}
                </Button>
            )}
        </div>
    );
}
