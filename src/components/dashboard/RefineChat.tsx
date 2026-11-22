"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    createProjectWithAI,
    generateGenerationQuestions,
    generateRequirements,
    generateUserStories,
    generatePersonas,
    generateWorkflows,
    generateTasks,
    generateUserJourneys,
    generateBusinessRules,
    generateTeamMembers,
    getProject,
} from "@/actions/project";
import {
    createRequirement,
    createUserStory,
    createPersona,
    createWorkflow,
    createTask,
    createUserJourney,
    createBusinessRule,
    createMember,
} from "@/actions/crud";
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

const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const similarity = (a: string, b: string) => {
    const ta = tokens(a);
    const tb = tokens(b);
    if (!ta.length || !tb.length) return 0;
    const inter = ta.filter((t) => tb.includes(t)).length;
    return inter / Math.min(ta.length, tb.length);
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
    artifact = "requirements",
}: {
    projectName: string;
    description: string;
    mode?: "create" | "open";
    projectId?: string;
    artifactCount?: number;
    artifactBreakdown?: Record<string, number>;
    artifact?: "requirements" | "stories" | "personas" | "workflows" | "tasks" | "journeys" | "businessrules" | "team";
}) {
    const isStories = artifact === "stories";
    const isPersonas = artifact === "personas";
    const isWorkflows = artifact === "workflows";
    const isTasks = artifact === "tasks";
    const isJourneys = artifact === "journeys";
    const isBusinessRules = artifact === "businessrules";
    const isTeam = artifact === "team";
    const artifactLabel = isStories ? "user stories"
        : isPersonas ? "personas"
        : isWorkflows ? "workflows"
        : isTasks ? "tasks"
        : isJourneys ? "user journeys"
        : isBusinessRules ? "business rules"
        : isTeam ? "team members"
        : "requirements";
    const itemsOf = (proj: any) =>
        isStories ? (proj?.userStories ?? [])
        : isPersonas ? (proj?.personas ?? [])
        : isWorkflows ? (proj?.workflows ?? [])
        : isTasks ? (proj?.tasks ?? [])
        : isJourneys ? (proj?.userJourneys ?? [])
        : isBusinessRules ? (proj?.businessRules ?? [])
        : isTeam ? (proj?.members ?? [])
        : (proj?.requirements ?? []);
    const titleOf = (r: any) => r.title ?? r.name;
    const textOf = (r: any) => {
        if (isPersonas) {
            return `${titleOf(r)} ${r.bio || ""} ${typeof r.goals === "string" ? r.goals : ""}`;
        }
        if (isTasks) {
            return `${titleOf(r)} ${typeof r.description === "string" ? r.description : ""}`;
        }
        if (isJourneys) {
            return `${titleOf(r)} ${typeof r.steps === "string" ? r.steps : ""}`;
        }
        if (isBusinessRules) {
            return `${titleOf(r)} ${typeof r.description === "string" ? r.description : ""} ${r.condition || ""}`;
        }
        if (isTeam) {
            return `${titleOf(r)} ${r.role || ""} ${r.email || ""}`;
        }
        return `${titleOf(r)} ${typeof r.content === "string" ? r.content : ""}`;
    };
    const slugOf = () =>
        isStories ? "stories"
        : isPersonas ? "personas"
        : isWorkflows ? "workflows"
        : isTasks ? "tasks"
        : isJourneys ? "journeys"
        : isBusinessRules ? "business-rules"
        : isTeam ? "team"
        : "requirements";
    const keyLabel = () =>
        isStories ? "User Stories"
        : isPersonas ? "Personas"
        : isWorkflows ? "Workflows"
        : isTasks ? "Tasks"
        : isJourneys ? "User Journeys"
        : isBusinessRules ? "Business Rules"
        : isTeam ? "Team"
        : "Requirements";
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
    const [reviewItems, setReviewItems] = useState<any[]>([]);
    const [showReview, setShowReview] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [keptBoth, setKeptBoth] = useState<Set<string>>(new Set());

    const questions = qList ?? DEFAULT_QUESTIONS;
    const done = questionIndex >= questions.length;
    const currentQuestion = !done ? questions[questionIndex] : null;

    // First-time / reload: nothing is generated until the user clicks Generate.
    const handleGenerate = () => {
        setLoadingQuestions(true);
        generateGenerationQuestions(projectId || "")
            .then((r: any) => {
                const answered = new Set((r?.existingContext || []).map((c: any) => c.questionId));
                const list = r?.questions?.length
                    ? r.questions
                          .filter((q: any) => !answered.has(q.id))
                          .map((q: any) => ({
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
            const before = await getProject(projectId);
            const beforeItems = itemsOf(before.project);
            const beforeTitles = beforeItems.map(titleOf);

            let result;
            let proposed: any[] = [];
            if (isStories) {
                result = await generateUserStories(projectId, pairs, { dryRun: true });
                proposed = result?.stories ?? [];
            } else if (isPersonas) {
                result = await generatePersonas(projectId, pairs, { dryRun: true });
                proposed = result?.personas ?? [];
            } else if (isWorkflows) {
                result = await generateWorkflows(projectId, pairs, { dryRun: true });
                proposed = result?.workflows ?? [];
            } else if (isTasks) {
                result = await generateTasks(projectId, pairs, { dryRun: true });
                proposed = result?.tasks ?? [];
            } else if (isJourneys) {
                result = await generateUserJourneys(projectId, pairs, { dryRun: true });
                proposed = result?.journeys ?? [];
            } else if (isBusinessRules) {
                result = await generateBusinessRules(projectId, pairs, { dryRun: true });
                proposed = result?.rules ?? [];
            } else if (isTeam) {
                result = await generateTeamMembers(projectId, pairs, { dryRun: true });
                proposed = result?.members ?? [];
            } else {
                result = await generateRequirements(
                    projectId,
                    pairs.map((p) => ({ question: p.question, selected: p.selected })),
                    beforeTitles,
                    { dryRun: true },
                );
                proposed = result?.requirements ?? [];
            }
            if (result?.error) throw new Error(result.error);

            if (proposed.length === 0) {
                throw new Error(`No ${artifactLabel} were generated`);
            }

            const reviewed = proposed.map((r: any) => {
                const ex = beforeItems.find((e: any) => similarity(textOf(r), textOf(e)) > 0.45) || null;
                return { ...r, conflict: ex ? { title: titleOf(ex), content: isPersonas ? ex.bio : ex.content } : null };
            });

            setReviewItems(reviewed);
            setShowReview(true);
            setGenerating(false);
        } catch {
            toast.error(`Failed to generate ${artifactLabel}`);
            setGenerating(false);
        }
    };

    const removeReviewItem = (id: string) => {
        const next = reviewItems.filter((r) => r.id !== id);
        setReviewItems(next);
        if (next.length === 0) {
            setShowReview(false);
        }
    };

    const commitReview = async () => {
        const kept = reviewItems;
        if (kept.length === 0) {
            setShowReview(false);
            router.push(`/projects/${projectId}/${slugOf()}`);
            return;
        }
        setCreating(true);
        try {
            for (const item of kept) {
                if (isStories) {
                    await createUserStory(projectId, {
                        title: item.title,
                        content: item.content,
                        acceptanceCriteria:
                            typeof item.acceptanceCriteria === "string"
                                ? item.acceptanceCriteria
                                : Array.isArray(item.acceptanceCriteria)
                                  ? item.acceptanceCriteria.join("\n")
                                  : undefined,
                        priority: item.priority,
                        storyPoints: item.storyPoints,
                    });
                } else if (isWorkflows) {
                    await createWorkflow(projectId, {
                        title: item.title,
                        content: typeof item.content === "string" ? item.content : JSON.stringify(item.content),
                        diagram: item.diagram,
                    });
                } else if (isTasks) {
                    await createTask(projectId, {
                        title: item.title,
                        description: item.description || "",
                        status: item.status || "TODO",
                        priority: item.priority || "MEDIUM",
                        assignee: item.assignee || "",
                    });
                } else if (isJourneys) {
                    await createUserJourney(projectId, {
                        title: item.title,
                        steps: Array.isArray(item.steps) ? JSON.stringify(item.steps) : String(item.steps ?? ""),
                    });
                } else if (isBusinessRules) {
                    await createBusinessRule(projectId, {
                        title: item.title,
                        description: item.description || "",
                        condition: item.condition || "",
                        action: item.action || "",
                    });
                } else if (isTeam) {
                    await createMember(projectId, {
                        name: item.name,
                        role: item.role || "",
                        email: item.email || "",
                    });
                } else if (isPersonas) {
                    await createPersona(projectId, {
                        name: item.name,
                        role: item.role || "",
                        bio: item.bio || "",
                        goals: Array.isArray(item.goals) ? JSON.stringify(item.goals) : String(item.goals ?? ""),
                        frustrations: Array.isArray(item.frustrations)
                            ? JSON.stringify(item.frustrations)
                            : String(item.frustrations ?? ""),
                    });
                } else {
                    await createRequirement(projectId, {
                        title: item.title,
                        content: item.content,
                        type: item.type || "functional",
                        priority: item.priority,
                    });
                }
            }
            toast.success(`Saved ${kept.length} ${artifactLabel}`);
            setShowReview(false);
            router.push(`/projects/${projectId}/${slugOf()}`);
        } catch {
            toast.error("Failed to save");
            setCreating(false);
        }
    };

    const planMore = async () => {
        if (!projectId) return;
        setPlanningMore(true);
        try {
            const result = isStories
                ? await generateUserStories(projectId)
                : isPersonas
                  ? await generatePersonas(projectId)
                  : await generateRequirements(projectId);
            if (result?.error) throw new Error(result.error);
            const refreshed = await getProject(projectId);
            if (refreshed.project) {
                const p: any = refreshed.project;
                const key = keyLabel();
                setArtifactMap((prev) => ({ ...prev, [key]: itemsOf(p).length }));
            }
            toast.success(isStories ? "Added more user stories" : isPersonas ? "Added more personas" : "Added more requirements");
        } catch {
            toast.error(isStories ? "Failed to add more user stories" : isPersonas ? "Failed to add more personas" : "Failed to add more requirements");
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
                        {generating ? "Generating" : isStories ? "Generate stories" : isPersonas ? "Generate personas" : "Generate plan"}
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
                            Plan more adds {artifactLabel} here. The other artifacts (Architecture, Workflows,
                            Tasks, and so on) are generated when you open their respective pages, one type at a
                            time, shaped to your taste.
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

            {/* Review new requirements — full-page view with diff */}
            {showReview && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white">
                    <div className="flex items-center justify-between border-b-2 border-black bg-white px-4 py-3 md:px-6">
                        <button
                            type="button"
                            onClick={() => setShowReview(false)}
                            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                        <h1 className="mx-2 truncate text-sm font-semibold text-black sm:text-base">Review new {artifactLabel}</h1>
                        <button
                            type="button"
                            onClick={commitReview}
                            disabled={creating}
                            className="nebula-btn nebula-btn--primary px-4 py-2 text-xs disabled:opacity-60"
                        >
                            {creating ? (
                                <>
                                    <KineticSpinner className="h-4 w-4" />
                                    Saving
                                </>
                            ) : (
                                "Save & continue"
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
                        <div className="mx-auto max-w-3xl space-y-4">
                            {reviewItems.length === 0 ? (
                                <p className="text-sm text-black/60">No new {artifactLabel} were generated.</p>
                            ) : (
                                reviewItems.map((r) => (
                                    <div key={r.id} className="border-2 border-black bg-white p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-black">{titleOf(r)}</p>
                                                <p className="mt-1.5 text-sm leading-relaxed text-black/70">
                                                    {isPersonas
                                                        ? typeof r.bio === "string"
                                                            ? r.bio
                                                            : ""
                                                        : typeof r.content === "string"
                                                          ? r.content
                                                          : ""}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                {r.conflict && !keptBoth.has(r.id) && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setKeptBoth((prev) => new Set(prev).add(r.id))
                                                        }
                                                        className="border-2 border-black px-3 py-1.5 font-mono text-xs uppercase tracking-tight transition-colors hover:bg-black hover:text-white"
                                                    >
                                                        Keep both
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    disabled={removingId === r.id}
                                                    onClick={() => removeReviewItem(r.id)}
                                                    className="border-2 border-black px-3 py-1.5 font-mono text-xs uppercase tracking-tight transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00] disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        {r.conflict && !keptBoth.has(r.id) && (
                                            <div className="mt-4 border-t-2 border-black pt-4">
                                                <p className="font-mono text-[11px] uppercase tracking-tight text-[#FF4D00]">
                                                    Overlaps existing
                                                </p>
                                                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                                    <div className="border-2 border-black p-3">
                                                        <p className="font-mono text-[11px] uppercase tracking-tight text-black/50">Existing</p>
                                                        <p className="mt-1 text-sm font-semibold text-black">{r.conflict.title}</p>
                                                        <p className="mt-1 text-sm text-black/60 line-clamp-3">{r.conflict.content}</p>
                                                    </div>
                                                    <div className="border-2 border-black bg-black p-3 text-white">
                                                        <p className="font-mono text-[11px] uppercase tracking-tight text-white/60">New</p>
                                                        <p className="mt-1 text-sm font-semibold">{titleOf(r)}</p>
                                                        <p className="mt-1 text-sm text-white/70 line-clamp-3">
                                                            {isPersonas
                                                                ? typeof r.bio === "string"
                                                                    ? r.bio
                                                                    : ""
                                                                : typeof r.content === "string"
                                                                  ? r.content
                                                                  : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
