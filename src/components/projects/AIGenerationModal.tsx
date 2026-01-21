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
}

export function AIGenerationModal({
    isOpen,
    onClose,
    projectId,
    type,
    onGenerate,
}: AIGenerationModalProps) {
    const [step, setStep] = useState<"loading" | "questions" | "generating">("loading");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [existingContext, setExistingContext] = useState<ExistingContext[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadQuestions = useCallback(async () => {
        try {
            setError(null);
            const result = await generateGenerationQuestions(projectId, type);
            if (result.error) {
                setError(result.error);
                return;
            }
            if (result.questions) {
                setQuestions(result.questions);
                setExistingContext(result.existingContext || []);
                setStep("questions");
                // Initialize answers
                const initialAnswers: Record<string, string[]> = {};
                result.questions.forEach((q: Question) => {
                    initialAnswers[q.id] = [];
                });
                setAnswers(initialAnswers);
            }
        } catch (err) {
            setError("Failed to load questions");
        }
    }, [projectId, type]);

    useEffect(() => {
        if (isOpen && step === "loading") {
            loadQuestions();
        }
    }, [isOpen, step]);

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
        try {
            const formattedAnswers = questions
                .map(q => ({
                    question: q.text,
                    selected: answers[q.id] || []
                }))
                .filter(a => a.selected.length > 0);

            // Save answers to context
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

            // Close modal immediately to prevent re-triggering
            onClose();
            await onGenerate(formattedAnswers);
        } catch (err) {
            setError("Failed to generate content");
            setStep("questions");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] bg-zinc-900 border-white/10 text-white max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-blue-400" />
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
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 mb-4">
                            {error}
                            <Button
                                variant="link"
                                className="text-red-400 underline ml-2"
                                onClick={loadQuestions}
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {step === "questions" && !error && (
                        <div className="space-y-6">
                            <p className="text-gray-400 text-sm">
                                Help the AI generate better results by answering a few questions.
                                You can select multiple options for each question.
                            </p>

                            {existingContext.length > 0 && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                    <div className="flex items-start gap-2 mb-2">
                                        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-300">Using your previous preferences</p>
                                            <p className="text-xs text-blue-400/70 mt-1">
                                                We&apos;ve remembered your choices from other modules
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2 text-xs text-gray-300">
                                        {existingContext.slice(0, 3).map((ctx, i) => (
                                            <div key={i} className="pl-4 border-l-2 border-blue-500/30">
                                                <p className="font-medium">{ctx.question}</p>
                                                <p className="text-gray-400">
                                                    {ctx.answers.join(", ")} <span className="text-gray-500">({ctx.module})</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {questions.map((q) => (
                                <div key={q.id} className="space-y-3">
                                    <h4 className="font-medium text-gray-200">{q.text}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {q.options.map((option) => (
                                            <div
                                                key={option}
                                                className={`
                                                    flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all
                                                    ${answers[q.id]?.includes(option)
                                                        ? "bg-blue-500/20 border-blue-500/50"
                                                        : "bg-white/5 border-white/10 hover:bg-white/10"}
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
                                                    className="text-sm font-normal text-gray-300 cursor-pointer leading-tight"
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

                <DialogFooter className="border-t border-white/10 pt-4">
                    <Button variant="ghost" onClick={onClose} disabled={step !== "questions"}>
                        Cancel
                    </Button>
                    {step === "questions" && (
                        <Button
                            onClick={handleGenerateClick}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Generate
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
