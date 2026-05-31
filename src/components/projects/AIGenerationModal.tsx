"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Wand2, Info } from "lucide-react";
import { generateGenerationQuestions, saveProjectContext } from "@/actions/project";
import { LoadingMessages } from "./LoadingMessages";

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
    onGenerate: (answers: Array<{ question: string; selected: string[] }>) => Promise<void>;
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
    const [step, setStep] = useState<"loading" | "questions" | "generating" | "error">("loading");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [existingContext, setExistingContext] = useState<ExistingContext[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string>("");
    const [retryCount, setRetryCount] = useState(0);

    const loadQuestions = useCallback(async () => {
        try {
            setError(null);
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
                .map(q => ({
                    question: q.text,
                    selected: answers[q.id] || []
                }))
                .filter(a => a.selected.length > 0);

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
            await onGenerate(formattedAnswers);
            
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
            <DialogContent className="sm:max-w-[700px] bg-[var(--color-nebula-surface)] border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-lg)] text-[color:var(--color-nebula-fg)] max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[color:var(--color-nebula-fg)]">
                        <div className="p-1.5 rounded-[var(--r-md)] bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)]">
                            <Wand2 className="w-4 h-4 text-[color:var(--color-nebula-fg)]" />
                        </div>
                        AI Generation Setup
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {step === "loading" && (
                        <LoadingMessages module={type} />
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
                                                    flex items-start space-x-3 p-3 rounded-[var(--r-md)] border cursor-pointer transition-all
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
                                                    className="mt-1"
                                                />
                                                <Label
                                                    htmlFor={`${q.id}-${option}`}
                                                    className="text-sm font-normal text-[color:var(--color-charcoal)] cursor-pointer leading-tight"
                                                >
                                                    {option}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-[var(--color-nebula-hairline-strong)] pt-4">
                    <Button variant="nebula-ghost" onClick={onClose} disabled={step !== "questions"}>
                        Cancel
                    </Button>
                    {step === "questions" && (
                        <Button
                            variant="nebula"
                            onClick={handleGenerateClick}
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Content
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
