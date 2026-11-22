"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProjectWithAI, generateGenerationQuestions, generateRequirements, getProject } from "@/actions/project";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";
import { ArrowLeft, Send, Box } from "lucide-react";

type Message = {
    role: "assistant" | "user";
    content: string;
};

type Question = {
    id: string;
    q: string;
    options: string[];
    type?: "single" | "multiple";
};

const DEFAULT_QUESTIONS: Question[] = [
    { id: "users", q: "Who is it for?", type: "single", options: ["Consumers", "Internal team", "Developers", "Businesses"] },
    { id: "feature", q: "What is the core feature?", type: "multiple", options: ["Browse and search", "Listings", "Payments", "Community"] },
    { id: "priority", q: "What matters most first?", type: "single", options: ["Get live fast", "Quality experience", "Monetization", "Growth"] },
];

export function RefineChat({
    projectName,
    description,
    mode = "create",
    projectId,
    artifactCount = 0,
    artifactBreakdown,
}: {
    projectName: string;
    description: string;
    mode?: "create" | "open";
    projectId?: string;
    artifactCount?: number;
    artifactBreakdown?: Record<string, number>;
}) {
    const router = useRouter();
    const [started, setStarted] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [qList, setQList] = useState<Question[] | null>(null);
    const [aiUnavailable, setAiUnavailable] = useState(false);
    const [autoNext, setAutoNext] = useState(false);
    const [awaitingNext, setAwaitingNext] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `Okay, we are building "${projectName}". ${description} Let me ask a few quick things to shape the plan.`,
        },
    ]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [draft, setDraft] = useState("");
    const [replyMode, setReplyMode] = useState<"questions" | "custom">("questions");
    const [creating, setCreating] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [otherOpen, setOtherOpen] = useState(false);
    const [otherText, setOtherText] = useState("");
    const [pairs, setPairs] = useState<{ question: string; selected: string[] }[]>([]);
    const [generating, setGenerating] = useState(false);
    const [showArtifacts, setShowArtifacts] = useState(false);
    const [planningMore, setPlanningMore] = useState(false);
    const [artifactMap, setArtifactMap] = useState<Record<string, number>>(artifactBreakdown ?? {});

    const questions = qList ?? DEFAULT_QUESTIONS;
    const done = questionIndex >= questions.length;
    const currentQuestion = !done ? questions[questionIndex] : null;

    // First-time / reload: nothing is generated until the user clicks Generate.
    const handleGenerate = () => {
        setLoadingQuestions(true);
        generateGenerationQuestions(projectId || "")
            .then((r: any) => {
                const list = r?.questions?.length
                    ? r.questions.map((q: any) => ({
                          id: q.id || "",
                          q: q.text || "",
                          options: q.options || [],
                          type: q.type === "multiple" ? "multiple" : "single",
                      }))
                    : [];
                setQList(list.length ? list : null);
                setAiUnavailable(list.length === 0);
            })
            .catch(() => {
                setQList(null);
                setAiUnavailable(true);
            })
            .finally(() => {
                setLoadingQuestions(false);
                setStarted(true);
            });
    };

    const advance = () => {
        const nextIndex = questionIndex + 1;
        setMessages((m) => [
            ...m,
            {
                role: "assistant",
                content:
                    nextIndex < questions.length
                        ? `Got it. Next: ${questions[nextIndex].q}`
                        : "That's enough to work with. Let's put the plan together.",
            },
        ]);
        setQuestionIndex(nextIndex);
        setAwaitingNext(false);
        setSelected([]);
        setOtherOpen(false);
        setOtherText("");
    };

    const submitQuestion = () => {
        const answers = [...selected];
        if (otherOpen && otherText.trim()) answers.push(otherText.trim());
        if (!answers.length) return;

        if (currentQuestion) {
            setPairs((prev) => [...prev, { question: currentQuestion.q, selected: answers }]);
        }
        setMessages((m) => [...m, { role: "user", content: answers.join(", ") }]);

        if (autoNext) {
            advance();
        } else {
            setAwaitingNext(true);
        }
    };

    const sendCustom = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setMessages((m) => [...m, { role: "user", content: trimmed }]);
        setDraft("");
    };

    const createProject = async () => {
        setCreating(true);
        try {
            const result = await createProjectWithAI(projectName, description, messages);
            if (result.success) {
                toast.success("Project created");
                router.push(`/projects/${result.projectId}`);
            } else {
                toast.error(result.error || "Failed to create project");
                setCreating(false);
            }
        } catch {
            toast.error("Something went wrong");
            setCreating(false);
        }
    };

    const generatePlanFromAnswers = async () => {
        if (!projectId || !pairs.length) return;
        setGenerating(true);
        try {
            const result = await generateRequirements(
                projectId,
                pairs.map((p) => ({ question: p.question, selected: p.selected })),
            );
            if (result?.error) throw new Error(result.error);
            toast.success("Plan generated");
            router.push(`/projects/${projectId}/requirements`);
        } catch {
            toast.error("Failed to generate the plan");
            setGenerating(false);
        }
    };

    const planMore = async () => {
        if (!projectId) return;
        setPlanningMore(true);
        try {
            const result = await generateRequirements(projectId);
            if (result?.error) throw new Error(result.error);
            const refreshed = await getProject(projectId);
            if (refreshed.project) {
                const p: any = refreshed.project;
                setArtifactMap((prev) => ({ ...prev, Requirements: p.requirements.length }));
            }
            toast.success("Added more requirements");
        } catch {
            toast.error("Failed to add more requirements");
        } finally {
            setPlanningMore(false);
        }
    };

    const finishAction = (
        <button
            type="button"
            onClick={
                mode === "open"
                    ? pairs.length
                        ? generatePlanFromAnswers
                        : () => (projectId ? router.push(`/projects/${projectId}`) : router.back())
                    : createProject
            }
            disabled={creating || generating}
            className="nebula-btn nebula-btn--primary w-full justify-center transition-opacity disabled:opacity-60"
        >
            {mode === "open" ? (
                pairs.length ? (
                    <>
                        {generating && <KineticSpinner className="h-4 w-4" />}
                        {generating ? "Generating plan" : "Generate plan"}
                    </>
                ) : (
                    "Done"
                )
            ) : creating ? (
                <>
                    <KineticSpinner className="h-4 w-4" />
                    Creating project
                </>
            ) : (
                "Create project"
            )}
        </button>
    );

    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* header */}
            <div className="border-b-2 border-black bg-white px-4 py-3">
                <div className="mx-auto flex max-w-2xl items-center justify-between">
                    <button
                        type="button"
                        onClick={() => (mode === "open" && projectId ? router.push(`/projects/${projectId}`) : router.push("/dashboard"))}
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <div className="flex items-center gap-3">
                        {mode === "open" && (
                            <button
                                type="button"
                                onClick={() => setShowArtifacts(true)}
                                aria-label="View artifacts"
                                className="inline-flex items-center gap-1.5 border-2 border-black px-2 py-1 transition-colors hover:border-[#FF4D00]"
                            >
                                <Box className="h-4 w-4 text-[#FF4D00]" />
                                <span className="text-xs font-semibold text-black">{artifactCount}</span>
                            </button>
                        )}
                        <div className="text-right">
                            <p className="text-sm font-semibold text-black">{projectName}</p>
                            <p className="font-mono text-[11px] uppercase tracking-tight text-[#FF4D00]">Refine</p>
                        </div>
                    </div>
                </div>
            </div>

            {!started ? (
                /* First open — Generate gate */
                <div className="flex flex-1 items-center justify-center px-4 py-16">
                    <div className="w-full max-w-xl text-center">
                        <h1 className="type-h3">Plan this project</h1>
                        <p className="mx-auto mt-3 max-w-md text-black/70">{description || projectName}</p>
                        <div className="mt-8 flex justify-center">
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={loadingQuestions}
                                className="nebula-btn nebula-btn--primary disabled:opacity-60"
                            >
                                {loadingQuestions ? (
                                    <>
                                        <KineticSpinner className="h-4 w-4" />
                                        Generating
                                    </>
                                ) : (
                                    "Generate"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* reply mode toggle */}
                    <div className="border-b-2 border-black bg-white px-4 py-2.5">
                        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2">
                            <label className="flex items-center gap-2 font-mono text-xs tracking-tight text-black/70">
                                <input
                                    type="checkbox"
                                    checked={autoNext}
                                    onChange={(e) => setAutoNext(e.target.checked)}
                                    className="h-4 w-4 accent-[#FF4D00]"
                                />
                                Auto-generate next
                            </label>
                            <div className="flex items-center gap-2 font-mono text-xs tracking-tight">
                                <span className="text-black/50">Reply with</span>
                                <button
                                    type="button"
                                    onClick={() => setReplyMode("questions")}
                                    className={`border-2 border-black px-3 py-1.5 transition-colors ${
                                        replyMode === "questions" ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
                                    }`}
                                >
                                    Questions
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReplyMode("custom")}
                                    className={`border-2 border-black px-3 py-1.5 transition-colors ${
                                        replyMode === "custom" ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
                                    }`}
                                >
                                    Custom
                                </button>
                            </div>
                        </div>
                    </div>

                    {replyMode === "questions" ? (
                        aiUnavailable && !qList ? (
                            <div className="flex flex-1 px-4 py-16">
                                <div className="mx-auto max-w-xl border-2 border-black p-6 text-center">
                                    <p className="text-sm text-black/70">No custom questions could be generated for this project.</p>
                                    <p className="mt-2 font-mono text-xs uppercase tracking-tight text-black/50">
                                        Switch to Custom to write your own reply.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 px-4 py-8">
                                <div className="mx-auto max-w-xl">
                                    {done ? (
                                        <div className="border-2 border-black p-6 text-center">
                                            <p className="text-sm text-black/70">
                                                Thanks, that's enough to work with. Let's put the plan together.
                                            </p>
                                            <div className="mt-6">{finishAction}</div>
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="type-h3">A few questions</h1>
                                            <p className="mt-2 text-sm text-black/60">Answer these to shape the plan.</p>
                                            <p className="mt-8 text-xl font-semibold text-black">{currentQuestion!.q}</p>
                                            {currentQuestion!.type === "multiple" && (
                                                <p className="mt-1.5 text-sm text-black/50">Select all that apply.</p>
                                            )}

                                            <div className="mt-5 flex flex-col gap-3">
                                                {currentQuestion!.options.map((opt) => {
                                                    const active = selected.includes(opt);
                                                    return (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() =>
                                                                setSelected((prev) =>
                                                                    currentQuestion!.type === "multiple"
                                                                        ? prev.includes(opt)
                                                                            ? prev.filter((x) => x !== opt)
                                                                            : [...prev, opt]
                                                                        : [opt],
                                                                )
                                                            }
                                                            className={`border-2 border-black p-4 text-left text-sm transition-colors ${
                                                                active ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}

                                                <button
                                                    type="button"
                                                    onClick={() => setOtherOpen((v) => !v)}
                                                    className={`border-2 border-black p-3 text-left text-sm transition-colors ${
                                                        otherOpen ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
                                                    }`}
                                                >
                                                    Other
                                                </button>

                                                {otherOpen && (
                                                    <input
                                                        value={otherText}
                                                        onChange={(e) => setOtherText(e.target.value)}
                                                        placeholder="Type your own answer…"
                                                        autoFocus
                                                        className="h-12 border-2 border-black bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                                                    />
                                                )}
                                            </div>

                                            {awaitingNext ? (
                                                <button
                                                    type="button"
                                                    onClick={advance}
                                                    className="nebula-btn nebula-btn--primary mt-6 w-full justify-center"
                                                >
                                                    {questionIndex + 1 < questions.length ? "Generate next" : "Finish"}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={submitQuestion}
                                                    disabled={selected.length === 0 && !(otherOpen && otherText.trim())}
                                                    className="nebula-btn nebula-btn--primary mt-6 w-full justify-center disabled:opacity-40"
                                                >
                                                    {autoNext ? "Next" : "Continue"}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    ) : (
                        <>
                            <div className="flex-1 px-4 py-6">
                                <div className="mx-auto max-w-2xl space-y-4">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={
                                                    m.role === "user"
                                                        ? "max-w-[80%] border-2 border-black bg-black px-4 py-2.5 text-sm leading-relaxed text-white"
                                                        : "max-w-[80%] border-2 border-black bg-white px-4 py-2.5 text-sm leading-relaxed text-black"
                                                }
                                            >
                                                {m.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="sticky bottom-0 z-10 border-t-2 border-black bg-white">
                                <div className="mx-auto max-w-2xl px-4 py-3">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            sendCustom(draft);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            value={draft}
                                            onChange={(e) => setDraft(e.target.value)}
                                            placeholder="Type your own message…"
                                            className="h-12 flex-1 border-2 border-black bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
                                        />
                                        <button
                                            type="submit"
                                            aria-label="Send"
                                            className="grid h-12 w-12 place-items-center border-2 border-black bg-black text-white transition-colors hover:bg-[#FF4D00] hover:text-black"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </form>
                                    {done && <div className="mt-4">{finishAction}</div>}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Artifact breakdown overlay */}
            {showArtifacts && mode === "open" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md border-2 border-black bg-white p-6">
                        <div className="flex items-center justify-between border-b-2 border-black pb-3">
                            <h2 className="type-h3">Artifacts</h2>
                            <button
                                type="button"
                                onClick={() => setShowArtifacts(false)}
                                aria-label="Back"
                                className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:text-[#FF4D00]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </div>
                        <ul className="mt-4 space-y-2">
                            {Object.entries(artifactMap).map(([k, v]) => (
                                <li key={k} className="flex items-center justify-between font-mono text-xs uppercase tracking-tight">
                                    <span className={v > 0 ? "text-black" : "text-black/40"}>{k}</span>
                                    <span className={v > 0 ? "font-semibold text-[#FF4D00]" : "text-black/40"}>{v}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-5 border-t-2 border-black pt-4 text-xs leading-relaxed text-black/60">
                            Plan more adds requirements here. The other artifacts (User Stories, Architecture,
                            Workflows, Tasks, and so on) are generated when you open their respective pages,
                            one type at a time, shaped to your taste.
                        </p>
                        <button
                            type="button"
                            onClick={planMore}
                            disabled={planningMore}
                            className="nebula-btn nebula-btn--primary mt-6 w-full justify-center disabled:opacity-60"
                        >
                            {planningMore ? (
                                <>
                                    <KineticSpinner className="h-4 w-4" />
                                    Adding…
                                </>
                            ) : (
                                "Plan more"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
