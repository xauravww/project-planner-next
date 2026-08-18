"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Wand2, Info, Layout, GitBranch, Server, Zap, Layers, Hexagon } from "lucide-react";
import { generateGenerationQuestions, saveProjectContext } from "@/actions/project";
import { LoadingMessages } from "./LoadingMessages";

interface ArchitecturalStyle {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    bestFor: string[];
}

const ARCHITECTURAL_STYLES: ArchitecturalStyle[] = [
    {
        id: "modular-monolith",
        name: "Modular Monolith",
        description: "Single deployable unit with clear internal boundaries. Best for small-to-medium teams.",
        icon: <Layers className="w-5 h-5" />,
        bestFor: ["Startups", "Small teams", "Simple domains", "Fast iteration"],
    },
    {
        id: "microservices",
        name: "Microservices",
        description: "Independently deployable services communicating via APIs. High scalability, high complexity.",
        icon: <Server className="w-5 h-5" />,
        bestFor: ["Large teams", "Complex domains", "Independent scaling", "Polyglot tech"],
    },
    {
        id: "serverless",
        name: "Serverless / Event-Driven",
        description: "Functions-as-a-service with event-driven communication. Auto-scaling, pay-per-use.",
        icon: <Zap className="w-5 h-5" />,
        bestFor: ["Variable load", "Event-driven domains", "Cost optimization", "Rapid prototyping"],
    },
    {
        id: "event-driven",
        name: "Event-Driven Architecture",
        description: "Services communicate via async events/message queues. Loose coupling, eventual consistency.",
        icon: <GitBranch className="w-5 h-5" />,
        bestFor: ["High throughput", "Audit trails", "CQRS/Event sourcing", "Decoupled domains"],
    },
    {
        id: "clean",
        name: "Clean Architecture",
        description: "Dependency inversion with entities at center. Testable, framework-independent.",
        icon: <Hexagon className="w-5 h-5" />,
        bestFor: ["Long-lived systems", "Complex business logic", "High testability", "Domain-driven design"],
    },
    {
        id: "layered",
        name: "Layered (N-Tier)",
        description: "Traditional presentation/business/data layers. Familiar, simple, but can couple layers.",
        icon: <Layout className="w-5 h-5" />,
        bestFor: ["Small apps", "Team familiar with pattern", "CRUD-heavy", "Quick delivery"],
    },
];

interface Question {
    id: string;
    text: string;
    options: string[];
}

interface ExistingContext {
    question: string;
    answers: string[];
    module: string;
}

interface AIGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    type: "requirements" | "architecture" | "workflows" | "stories" | "tech-stack" |
    "tasks" | "personas" | "journeys" | "mockups" | "business-rules" | "team";
    onGenerate: (answers: Array<{ question: string; selected: string[] }>, style?: string) => Promise<void>;
    isGenerating?: boolean;
}

export function AIGenerationModal({
    isOpen,
    onClose,
    projectId,
    type,
    onGenerate,
    isGenerating: isGeneratingProp = false,
}: AIGenerationModalProps) {
    const [step, setStep] = useState<"loading" | "style-selector" | "questions" | "generating" | "error">("loading");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [existingContext, setExistingContext] = useState<ExistingContext[]>([]);
    const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
    const [additionalContext, setAdditionalContext] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string>("");
    const [retryCount, setRetryCount] = useState(0);
    const [selectedStyle, setSelectedStyle] = useState<string>("modular-monolith");

    const isArchitecture = type === "architecture";

    const loadQuestions = useCallback(async () => {
        try {
            setError(null);
            if (isArchitecture) {
                setStep("style-selector");
                return;
            }
            setStep("loading");
            const result = await generateGenerationQuestions(projectId, type);
            if (result.error) {
                setError(result.error);
                setStep("error");
                return;
            }
            if (result.questions && result.questions.length > 0) {
                setQuestions(result.questions);
                setExistingContext(result.existingContext || []);
                setStep("questions");
                // Initialize answers if not already set
                setAnswers(prev => {
                    const initialAnswers: Record<string, string[]> = { ...prev };
                    result.questions.forEach((q: Question) => {
                        if (!initialAnswers[q.id]) {
                            initialAnswers[q.id] = [];
                        }
                    });
                    return initialAnswers;
                });
            } else {
                // No questions needed, go straight to generation
                setStep("questions");
                setQuestions([]);
            }
        } catch (err) {
            setError("Failed to load questions. Please try again.");
            setStep("error");
        }
    }, [projectId, type]);

    useEffect(() => {
        if (isOpen) {
            // Reset state when opening
            if (questions.length === 0) {
                loadQuestions();
            } else {
                setStep("questions");
            }
        }
    }, [isOpen]);

    const handleAnswerToggle = (questionId: string, option: string) => {
        setAnswers(prev => {
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

    const handleGenerateClick = async () => {
        setStep("generating");
        setProgressMessage("Preparing your answers...");
        
        try {
            const formattedAnswers = questions
                .map(q => {
                    const selected = [...(answers[q.id] || [])];
                    if (customAnswers[q.id]?.trim()) {
                        selected.push(customAnswers[q.id].trim());
                    }
                    return {
                        question: q.text,
                        selected
                    };
                })
                .filter(a => a.selected.length > 0);

            if (additionalContext.trim()) {
                formattedAnswers.push({
                    question: "Additional Context / Specific Instructions from User",
                    selected: [additionalContext.trim()]
                });
            }

            // Save answers to context
            setProgressMessage("Saving your preferences...");
            for (const q of questions) {
                if (answers[q.id] && answers[q.id].length > 0) {
                    await saveProjectContext(
                        projectId,
                        q.id,
                        q.text,
                        answers[q.id],
                        type
                    );
                }
            }

            setProgressMessage("AI is generating your content...");
            await onGenerate(formattedAnswers, isArchitecture ? selectedStyle : undefined);
            
            // Only close on success
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to generate content. Please try again.");
            setStep("error");
        }
    };

    const handleRetry = () => {
        if (step === "error" && error?.includes("questions")) {
            loadQuestions();
        } else {
            // Retry generation - keep answers
            handleGenerateClick();
        }
        setRetryCount(c => c + 1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-2xl text-[color:var(--color-nebula-fg)] max-h-[85vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 py-5 relative z-10 border-b border-[var(--color-nebula-hairline-strong)]">
                    <DialogTitle className="flex items-center gap-3 text-[color:var(--color-nebula-fg)] type-h3">
                        <div className="p-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-nebula-hairline-strong)]">
                            <Wand2 className="w-5 h-5 text-[color:var(--color-nebula-fg)]" />
                        </div>
                        AI Generation Setup
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10 custom-scrollbar">
                    {step === "loading" && (
                        <LoadingMessages module={type} />
                    )}

                    {step === "style-selector" && (
                        <div className="space-y-6">
                            <p className="type-small text-[color:var(--color-charcoal)]">
                                Choose the architectural style that best fits your project. This determines how the system is structured at a high level.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ARCHITECTURAL_STYLES.map((style) => (
                                    <div
                                        key={style.id}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 \${
                                            selectedStyle === style.id
                                                ? "border-[var(--color-nebula-fg)] bg-[var(--color-nebula-surface)]"
                                                : "border-[var(--color-nebula-hairline-strong)] hover:border-[var(--color-nebula-fg)]/50"
                                        }`}
                                        onClick={() => setSelectedStyle(style.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-nebula-hairline-strong)] flex-shrink-0">
                                                {style.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="type-h4 font-semibold">{style.name}</h4>
                                                <p className="type-small text-[color:var(--color-charcoal)] mt-1">{style.description}</p>
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {style.bestFor.map((item) => (
                                                        <span key={item} className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-nebula-hairline)] text-[color:var(--color-ash)]">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === "generating" && (
                        <LoadingMessages module={type} />
                    )}

                    {error && (
                        <div className="bg-[var(--color-accent-red-glow)] border border-[color:var(--color-accent-red)] rounded-[var(--r-md)] p-4 text-[color:var(--color-accent-red)] mb-4">
                            {error}
                            <Button
                                variant="link"
                                className="text-[color:var(--color-accent-red)] underline ml-2"
                                onClick={loadQuestions}
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {step === "questions" && !error && (
                        <div className="space-y-6">
                            <p className="type-small text-[color:var(--color-charcoal)]">
                                Help the AI generate better results by answering a few questions.
                                You can select multiple options for each question.
                            </p>

                            {existingContext.length > 0 && (
                                <div className="bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] p-4">
                                    <div className="flex items-start gap-2 mb-2">
                                        <Info className="w-4 h-4 text-[color:var(--color-nebula-fg)] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="type-small text-[color:var(--color-nebula-fg)]">Using your previous preferences</p>
                                            <p className="type-caption mt-1">
                                                We&apos;ve remembered your choices from other modules
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2 text-xs text-[color:var(--color-charcoal)]">
                                        {existingContext.slice(0, 3).map((ctx, i) => (
                                            <div key={i} className="pl-4 border-l-2 border-[var(--color-nebula-hairline-strong)]">
                                                <p className="font-medium">{ctx.question}</p>
                                                <p className="text-[color:var(--color-charcoal)]">
                                                    {ctx.answers.join(", ")} <span className="text-[color:var(--color-ash)]">({ctx.module})</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {questions.map((q) => (
                                <div key={q.id} className="space-y-3">
                                    <h4 className="type-h4">{q.text}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {q.options.map((option) => (
                                            <div
                                                key={option}
                                                className={`
                                                    flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition-all duration-300
                                                    ${answers[q.id]?.includes(option)
                                                        ? "bg-[var(--color-surface-elevated)] border-[color:var(--color-nebula-fg)]"
                                                        : "bg-[var(--color-nebula-surface)] border-[var(--color-nebula-hairline-strong)] hover:bg-[var(--color-surface-elevated)]"}
                                                `}
                                                onClick={() => handleAnswerToggle(q.id, option)}
                                            >
                                                <Checkbox
                                                    id={`${q.id}-${option}`}
                                                    checked={answers[q.id]?.includes(option)}
                                                    onCheckedChange={() => handleAnswerToggle(q.id, option)}
                                                    className="mt-0.5"
                                                />
                                                <Label
                                                    htmlFor={`${q.id}-${option}`}
                                                    className={`text-sm font-medium cursor-pointer leading-tight ${answers[q.id]?.includes(option) ? "text-[color:var(--color-nebula-fg)]" : "text-[color:var(--color-charcoal)]"}`}
                                                >
                                                    {option}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2">
                                        <Input 
                                            placeholder="Other (please specify)..." 
                                            value={customAnswers[q.id] || ""}
                                            onChange={(e) => setCustomAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                            className="bg-[var(--color-nebula-surface)] border-[var(--color-nebula-hairline-strong)] text-[color:var(--color-nebula-fg)] text-sm h-9"
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6 border-t border-[var(--color-nebula-hairline-strong)] mt-4">
                                <h4 className="type-h4 mb-3">Any specific instructions or additional context?</h4>
                                <textarea
                                    value={additionalContext}
                                    onChange={(e) => setAdditionalContext(e.target.value)}
                                    placeholder="e.g., Make sure to focus heavily on the enterprise B2B features, keep it concise, etc..."
                                    className="flex w-full rounded-xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] px-4 py-3 text-sm text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] focus:outline-none focus:ring-1 focus:ring-[var(--color-nebula-fg)] min-h-[100px] resize-y transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-5 border-t border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-bg)]/50 relative z-10 flex flex-row justify-between sm:justify-end gap-3">
                    <Button variant="nebula-ghost" onClick={onClose} disabled={step === "generating"} className="px-6">
                        Cancel
                    </Button>
                    {step === "style-selector" && (
                        <Button
                            variant="nebula"
                            onClick={() => {
                                loadQuestions();
                            }}
                            className="px-6 transition-all"
                        >
                            Next
                        </Button>
                    )}
                    {step === "questions" && (
                        <Button
                            variant="nebula"
                            onClick={handleGenerateClick}
                            className="px-6 transition-all"
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            {Object.values(answers).some(a => a.length > 0) || Object.values(customAnswers).some(a => a.trim().length > 0) || additionalContext.trim().length > 0
                                ? "Generate Content"
                                : "Skip & Generate"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
