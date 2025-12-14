"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Send, Sparkles, ArrowLeft, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { createProjectWithAI } from "@/actions/project";
import { useRouter } from "next/navigation";
import { MessageContent } from "@/components/chat/MessageContent";


// Predefined questions for new projects
const DEFAULT_QUESTIONS = [
    {
        id: "target_audience",
        text: "Who is your target audience?",
        options: ["General public", "Businesses", "Developers", "Students", "Professionals"]
    },
    {
        id: "scale",
        text: "What scale are you targeting?",
        options: ["Small/MVP", "Medium/Regional", "Large/Global", "Enterprise"]
    },
    {
        id: "priorities",
        text: "What are your top priorities?",
        options: ["Speed to market", "Scalability", "User experience", "Security", "Cost efficiency"]
    },
    {
        id: "platform",
        text: "Which platforms do you need?",
        options: ["Web only", "Mobile (iOS)", "Mobile (Android)", "Desktop", "All platforms"]
    }
];

export default function NewProjectPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [showMCQModal, setShowMCQModal] = useState(false);
    const [mcqAnswers, setMcqAnswers] = useState<Record<string, string[]>>({});
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const append = async (message: { role: string; content: string }) => {
        const userMessage = { id: Date.now().toString(), ...message };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const answersArray = Object.values(mcqAnswers).flat();
            const contextMessage = answersArray.length > 0
                ? `\n\nUser preferences:\n${answersArray.join("\n")}`
                : "";

            // Add system message for simple, conversational guidance
            const systemMessage = {
                role: "system" as const,
                content: `You are a friendly AI project planning assistant helping users brainstorm their project ideas.

KEEP IT SIMPLE AND CONVERSATIONAL:
- Have a natural, friendly conversation to understand their project idea
- Ask clarifying questions about what they want to build
- Discuss target audience, main features, and goals
- Keep responses concise and easy to read
- Use simple bullet points and short paragraphs

DO NOT:
- Create diagrams, flowcharts, or architecture sketches
- Write detailed technical specifications
- Generate code or implementation details
- Go into deep technical planning

Remember: This is just the initial brainstorming chat. Detailed planning, diagrams, and technical specs will be created later in dedicated project modules.`
            };

            console.log("Sending messages to /api/chat:", [systemMessage, ...messages, { ...userMessage, content: userMessage.content + contextMessage }]);

            // Use the Next.js API route for chat
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [systemMessage, ...messages, { ...userMessage, content: userMessage.content + contextMessage }],
                }),
            });

            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);

            if (!response.ok) throw new Error("Failed to fetch from AI server");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            const assistantMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: "" };

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
        setLocalInput(prompt);
        setShowMCQModal(true);
    };

    const handleAnswerToggle = (questionId: string, option: string) => {
        setMcqAnswers(prev => {
            const current = prev[questionId] || [];
            if (current.includes(option)) {
                return {
                    ...prev,
                    [questionId]: current.filter(o => o !== option)
                };
            } else {
                return {
                    ...prev,
                    [questionId]: [...current, option]
                };
            }
        });
    };

    const handleMCQSubmit = async () => {
        setShowMCQModal(false);
        if (localInput.trim()) {
            await append({ role: "user", content: localInput });
            setLocalInput("");
        }
    };

    const extractProjectInfo = () => {
        // Extract project name from conversation
        const lastUserMessage = messages.filter((m) => m.role === "user").pop();

        if (lastUserMessage) {
            // Use last user message as project name
            const name = lastUserMessage.content.slice(0, 100);
            return { name };
        }

        return { name: "New Project" };
    };

    const handleCreateProject = async () => {
        setIsCreating(true);
        const { name } = extractProjectInfo();

        const result = await createProjectWithAI(
            name,
            undefined, // description will be generated by AI
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
        <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Create New Project with AI
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Describe your project idea and let AI help you plan it
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMCQModal(true)}
                        className="flex items-center gap-2"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Answer Questions
                    </Button>
                </div>
            </div>

            {/* Chat Container */}
            <GlassCard className="flex flex-col h-[600px]">
                <div className="flex-1 flex flex-col p-6 space-y-4 min-h-0">
                    {/* Messages */}
                    <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden pr-2 min-h-0">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.role === "user"
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                        : "bg-white/10 text-gray-200 border border-white/5"
                                        }`}
                                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                                >
                                    {msg.role === "assistant" && (
                                        <Sparkles className="w-4 h-4 inline mr-2 text-yellow-400" />
                                    )}
                                    {msg.role === "user" ? (
                                        <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                                    ) : (
                                        <div className="prose prose-invert prose-sm max-w-none break-words">
                                            <MessageContent content={msg.content} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 border border-white/5 rounded-2xl px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                        <span className="text-sm text-gray-400">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts (only show initially) */}
                    {messages.length === 1 && (
                        <div className="border-t border-white/10 pt-4">
                            <p className="text-sm font-medium text-gray-300 mb-3">Quick starts:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickPrompt(prompt)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all hover:scale-105"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleLocalSubmit} className="flex gap-3 border-t border-white/10 pt-4">
                        <Input
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder="Describe your project idea..."
                            className="flex-1 h-12"
                            disabled={isLoading === true}
                        />
                        <Button
                            type="submit"
                            disabled={(isLoading === true) || !localInput.trim()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </GlassCard>

            {/* Create Project Button */}
            {messages.length > 2 && (
                <Button
                    onClick={handleCreateProject}
                    disabled={isCreating}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 text-lg shadow-lg"
                >
                    {isCreating ? "Creating Project..." : "Create Project"}
                </Button>
            )}

            {/* Simple MCQ Modal */}
            <Dialog open={showMCQModal} onOpenChange={setShowMCQModal}>
                <DialogContent className="sm:max-w-[700px] bg-zinc-900 border-white/10 text-white max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-blue-400" />
                            Help us understand your project better
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <p className="text-sm text-gray-400">
                            Answer these questions to get more tailored suggestions (optional, select multiple):
                        </p>

                        {DEFAULT_QUESTIONS.map((q) => (
                            <div key={q.id} className="space-y-3">
                                <h4 className="font-medium text-gray-200">{q.text}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {q.options.map((option) => (
                                        <div
                                            key={option}
                                            className={`
                                                flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all
                                                ${mcqAnswers[q.id]?.includes(option)
                                                    ? "bg-blue-500/20 border-blue-500/50"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10"}
                                            `}
                                            onClick={() => handleAnswerToggle(q.id, option)}
                                        >
                                            <Checkbox
                                                id={`${q.id}-${option}`}
                                                checked={mcqAnswers[q.id]?.includes(option)}
                                                onCheckedChange={() => handleAnswerToggle(q.id, option)}
                                                className="mt-1"
                                            />
                                            <Label
                                                htmlFor={`${q.id}-${option}`}
                                                className="text-sm font-normal text-gray-300 cursor-pointer leading-tight flex-1"
                                            >
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                        <Button variant="ghost" onClick={() => setShowMCQModal(false)}>
                            Skip
                        </Button>
                        <Button
                            onClick={handleMCQSubmit}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Continue
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
