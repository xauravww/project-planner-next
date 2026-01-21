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
import { generateProjectQuestions } from "@/actions/ai-questions";
import { useRouter } from "next/navigation";
import { MessageContent } from "@/components/chat/MessageContent";
import AetherBackground from "@/components/ui/aether-background"; // Rebuild trigger
import { ProjectReadiness } from "@/components/dashboard/ProjectReadiness";
import { ClaudeChatInput } from "@/components/ui/claude-chat-input";

interface Question {
    id: string;
    text: string;
    options: string[];
}

export default function NewProjectPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [showMCQModal, setShowMCQModal] = useState(false);
    const [mcqAnswers, setMcqAnswers] = useState<Record<string, string[]>>({});
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
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

    // Calculate Readiness
    const hasStarted = messages.length > 2;
    const hasMCQ = Object.keys(mcqAnswers).length > 0;

    // Simple heuristic for readiness
    const readiness = {
        hasIdea: messages.length > 2,
        hasAudience: hasMCQ || messages.length > 4, // Assume if they answered MCQs or chatted enough
        hasFeatures: messages.length > 6,
        hasGoal: Object.keys(mcqAnswers).length >= 2,
    };

    const readinessScore = (Object.values(readiness).filter(Boolean).length / 4) * 100;

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

    const loadQuestions = async (topic?: string) => {
        setIsLoadingQuestions(true);
        setQuestions([]); // Clear previous

        const result = await generateProjectQuestions(topic);

        if (result.success && result.questions) {
            setQuestions(result.questions);
        } else {
            // Fallback if AI fails
            setQuestions([
                {
                    id: "fallback_type",
                    text: "What type of project is this?",
                    options: ["Web App", "Mobile App", "Desktop Software", "API/Service"]
                },
                {
                    id: "fallback_scale",
                    text: "What is the expected scale?",
                    options: ["Prototype", "Small Business", "Enterprise"]
                }
            ]);
        }
        setIsLoadingQuestions(false);
    };

    const handleLocalSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!localInput.trim()) return;

        await append({ role: "user", content: localInput });
        setLocalInput("");
    };

    const handleQuickPrompt = (prompt: string) => {
        setLocalInput(prompt);
        setShowMCQModal(true);
        // Load questions relevant to the prompt
        loadQuestions(prompt);
    };

    const handleOpenGuide = () => {
        setShowMCQModal(true);
        // If there's input, use it, otherwise general
        loadQuestions(localInput || undefined);
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
        <div className="relative min-h-[calc(100vh-4rem)] w-full bg-black overflow-hidden flex flex-col items-center">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0">
                <AetherBackground
                    variant="grid"
                    overlayGradient="linear-gradient(180deg, #000000 0%, transparent 40%, transparent 60%, #000000 100%)"
                    className="opacity-30"
                />
            </div>

            <div className="container max-w-[1600px] mx-auto px-4 py-4 h-[calc(100vh-2rem)] flex flex-col relative z-10">
                {/* Header - Minimal & Compact */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>

                    {/* Mobile Readiness Indicator (Simple) */}
                    <div className="lg:hidden flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-400">Readiness</span>
                        <div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${readinessScore}%` }} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    {/* Chat Container - Takes up more space */}
                    <div className="lg:col-span-9 h-full flex flex-col min-h-0">
                        <GlassCard className="flex-1 flex flex-col border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-none scroll-smooth">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[90%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${msg.role === "user"
                                                ? "bg-white text-black font-medium"
                                                : "bg-white/5 text-zinc-200 border border-white/5"
                                                }`}
                                            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                                        >
                                            {msg.role === "assistant" && (
                                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                                                    <Sparkles className="w-3 h-3 text-blue-400" />
                                                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">NebulaPlan AI</span>
                                                </div>
                                            )}
                                            {msg.role === "user" ? (
                                                <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                                            ) : (
                                                <div className="prose prose-invert prose-sm max-w-none break-words text-zinc-300">
                                                    <MessageContent content={msg.content} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start animate-pulse">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-3">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                            <span className="text-sm text-zinc-500">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>

                            {/* Quick Prompts */}
                            {
                                messages.length === 1 && (
                                    <div className="px-8 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider pl-1">Start with an idea</p>
                                        <div className="flex flex-wrap gap-2">
                                            {quickPrompts.map((prompt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleQuickPrompt(prompt)}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl text-sm text-zinc-300 hover:text-white transition-all duration-300"
                                                >
                                                    {prompt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }

                            {/* Input Area - Fixed at bottom of card */}
                            < div className="p-4 md:p-6 bg-black/40 border-t border-white/5 backdrop-blur-md flex flex-col gap-2" >
                                <div className="flex justify-end px-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleOpenGuide}
                                        className="text-xs text-zinc-500 hover:text-blue-400 hover:bg-white/5 gap-2"
                                    >
                                        <HelpCircle className="w-3 h-3" />
                                        Need inspiration? Open Guide
                                    </Button>
                                </div>
                                <ClaudeChatInput
                                    onSendMessage={(msg, files) => {
                                        // TODO: Handle files if needed in the future
                                        setLocalInput(msg);
                                        // We need to call handleLocalSubmit, but it expects an event or relies on state
                                        // Let's modify handleLocalSubmit to accept a string arg or just call the logic directly

                                        if (!msg.trim()) return;

                                        const userMsg = {
                                            id: Date.now().toString(),
                                            role: "user",
                                            content: msg,
                                        };

                                        setMessages((prev) => [...prev, userMsg]);
                                        setLocalInput(""); // Clear local input
                                        setIsLoading(true);

                                        // Call API
                                        fetch("/api/chat", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                messages: [...messages, userMsg], // Send full history including new message
                                            }),
                                        })
                                            .then(async (res) => {
                                                if (!res.ok) throw new Error(res.statusText);
                                                if (!res.body) throw new Error("No response body");

                                                const reader = res.body.getReader();
                                                const decoder = new TextDecoder();
                                                let assistantMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: "" };

                                                setMessages((prev) => [...prev, assistantMessage]);

                                                while (true) {
                                                    const { done, value } = await reader.read();
                                                    if (done) break;
                                                    const text = decoder.decode(value, { stream: true });
                                                    assistantMessage.content += text;
                                                    setMessages((prev) => [
                                                        ...prev.slice(0, -1),
                                                        { ...assistantMessage }
                                                    ]);
                                                }
                                            })
                                            .catch((err) => {
                                                console.error("Chat error:", err);
                                                setMessages((prev) => [
                                                    ...prev,
                                                    { id: Date.now().toString(), role: "assistant", content: "Sorry, I encountered an error. Please try again." }
                                                ]);
                                            })
                                            .finally(() => setIsLoading(false));
                                    }}
                                    disabled={isLoading}
                                    placeholder="Describe your project idea... (e.g. 'A marketplace for vintage cameras')"
                                />
                            </div>
                        </GlassCard>
                    </div>

                    {/* Readiness Panel - Sidebar on Desktop */}
                    <div className="hidden lg:col-span-3 lg:flex flex-col gap-4 h-full min-h-0">
                        <GlassCard className="flex-1 p-6 border-white/10 bg-black/60 backdrop-blur-2xl flex flex-col gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">Project Blueprint</h3>
                                <p className="text-sm text-zinc-500">Track your planning progress</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <ProjectReadiness values={readiness} />
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <Button
                                    onClick={handleCreateProject}
                                    disabled={isCreating || readinessScore < 50}
                                    className={`
                                        w-full py-6 text-base font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]
                                        ${readinessScore >= 50
                                            ? "bg-white text-black hover:bg-zinc-200 shadow-white/10"
                                            : "bg-zinc-900 border border-white/5 text-zinc-500 cursor-not-allowed"}
                                    `}
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        `Launch Workspace (${Math.round(readinessScore)}%)`
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Mobile FAB for Launch */}
                <div className="lg:hidden fixed bottom-6 right-6 z-50">
                    <Button
                        onClick={handleCreateProject}
                        disabled={isCreating || readinessScore < 50}
                        size="lg"
                        className={`
                            rounded-full shadow-2xl font-bold flex items-center gap-2
                            ${readinessScore >= 50
                                ? "bg-white text-black hover:bg-zinc-200"
                                : "bg-zinc-800 text-zinc-500 border border-white/10"}
                        `}
                    >
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {Math.round(readinessScore)}% Launch
                    </Button>
                </div>

                {/* Simple MCQ Modal */}
                <Dialog open={showMCQModal} onOpenChange={setShowMCQModal}>
                    <DialogContent className="sm:max-w-[700px] bg-zinc-900 border-white/10 text-white max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-blue-400" />
                                Help us understand your project better
                            </DialogTitle>
                        </DialogHeader>

                        {isLoadingQuestions ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                <p className="text-zinc-400">Generating relevant questions...</p>
                            </div>
                        ) : (
                            <div className="space-y-6 py-4">
                                {questions.map((q) => (
                                    <div key={q.id} className="space-y-3">
                                        <h4 className="font-medium text-gray-200">{q.text}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[...q.options, "Other"].map((option) => (
                                                <div
                                                    key={option}
                                                    className={`
                                                    flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all relative
                                                    ${mcqAnswers[q.id]?.includes(option) && option !== "Other"
                                                            ? "bg-blue-500/20 border-blue-500/50"
                                                            : "bg-white/5 border-white/10 hover:bg-white/10"}
                                                    `}
                                                    onClick={(e) => {
                                                        // Prevent toggling if clicking directly on the input or checkbox to avoid double events
                                                        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).role === 'checkbox') {
                                                            return;
                                                        }

                                                        if (option === "Other") {
                                                            const input = document.getElementById(`${q.id}-Other-Input`);
                                                            input?.focus();
                                                        } else {
                                                            handleAnswerToggle(q.id, option);
                                                        }
                                                    }}
                                                >
                                                    <Checkbox
                                                        id={`${q.id}-${option}`}
                                                        checked={mcqAnswers[q.id]?.includes(option) || (option === "Other" && !!mcqAnswers[q.id]?.some(a => !q.options.includes(a)))}
                                                        onCheckedChange={() => {
                                                            if (option === "Other") {
                                                                const input = document.getElementById(`${q.id}-Other-Input`);
                                                                input?.focus();
                                                            } else {
                                                                handleAnswerToggle(q.id, option);
                                                            }
                                                        }}
                                                        className="mt-1"
                                                    />

                                                    {option === "Other" ? (
                                                        <Input
                                                            id={`${q.id}-Other-Input`}
                                                            placeholder="Other (Type here...)"
                                                            className="flex-1 bg-transparent border-none text-sm h-8 p-0 focus-visible:ring-0 placeholder:text-zinc-500 text-white"
                                                            value={mcqAnswers[q.id]?.find(a => !q.options.includes(a)) || ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                // Remove any existing custom values
                                                                const currentAnswers = mcqAnswers[q.id] || [];
                                                                const standardOptions = q.options;
                                                                const newAnswers = currentAnswers.filter(a => standardOptions.includes(a));

                                                                if (val.trim()) {
                                                                    setMcqAnswers(prev => ({
                                                                        ...prev,
                                                                        [q.id]: [...newAnswers, val]
                                                                    }));
                                                                } else {
                                                                    setMcqAnswers(prev => ({
                                                                        ...prev,
                                                                        [q.id]: newAnswers
                                                                    }));
                                                                }
                                                            }}
                                                            onClick={(e) => e.stopPropagation()} // Prevent triggering parent onClick
                                                        />
                                                    ) : (
                                                        <Label
                                                            htmlFor={`${q.id}-${option}`}
                                                            className="text-sm font-normal text-gray-300 cursor-pointer leading-tight flex-1"
                                                        >
                                                            {option}
                                                        </Label>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

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
        </div>
    );
}
