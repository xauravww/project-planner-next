"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

const EXAMPLES = [
    "A mobile app for splitting rent with roommates",
    "A booking tool for small music venues",
    "A time tracker for freelance designers",
];

type Plan = {
    stories: { id: string; title: string; tag: string }[];
    modules: string[];
    tasks: { title: string; done: boolean }[];
};

function generatePlan(raw: string): Plan {
    // Simulated generation: a clean, believable plan from the idea text.
    const seed = raw.trim() || "your idea";
    const noun = seed.split(" ").slice(0, 4).join(" ");
    return {
        stories: [
            { id: "S-01", title: `A user signs up and creates their first project for ${noun}`, tag: "Auth" },
            { id: "S-02", title: "Project owner defines the scope in plain text", tag: "Planning" },
            { id: "S-03", title: "Team sees stories, architecture, and backlog in one view", tag: "Planning" },
            { id: "S-04", title: "Owner exports tasks to Linear or GitHub Issues", tag: "Export" },
        ],
        modules: ["Auth", "Projects", "Plan engine", "Export", "Notifications"],
        tasks: [
            { title: "Initialize project schema", done: true },
            { title: "Build the plan editor", done: true },
            { title: "Wire AI generation", done: false },
            { title: "Add Linear export", done: false },
        ],
    };
}

export function LiveCanvas() {
    const [input, setInput] = useState("");
    const [plan, setPlan] = useState<Plan | null>(null);
    const [generating, setGenerating] = useState(false);

    const run = (idea?: string) => {
        const value = (idea ?? input).trim();
        if (!value) return;
        setGenerating(true);
        // small delay so the transition reads as "working"
        setTimeout(() => {
            setPlan(generatePlan(value));
            setGenerating(false);
        }, 650);
    };

    return (
        <section id="live" className="relative min-h-[calc(100svh)] flex flex-col justify-center overflow-hidden bg-[var(--color-nebula-bg)]">
            {/* subtle top wash */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[var(--color-accent-blue-glow)] to-transparent" />

            <div className="relative z-10 w-full container mx-auto px-6 max-w-[1200px] py-10">
                <div className="grid lg:grid-cols-5 gap-10 items-stretch">
                    {/* Left: prompt */}
                    <div className="lg:col-span-2 space-y-5">
                        <h1 className="type-display-xl text-[color:var(--color-nebula-fg)]">
                            Plan a project, right here.
                        </h1>
                        <p className="type-subtitle">
                            Type an idea. NebulaPlan turns it into user stories, an architecture map, and a backlog. This page is the product.
                        </p>

                        <form
                            onSubmit={(e) => { e.preventDefault(); run(); }}
                            className="space-y-3"
                        >
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe your product idea..."
                                rows={3}
                                className="w-full rounded-xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] p-4 text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] outline-none focus:border-[var(--color-accent-blue)] transition-colors resize-none"
                            />
                            <button
                                type="submit"
                                disabled={generating || !input.trim()}
                                className="nebula-btn nebula-btn--primary h-11 px-6 w-full disabled:opacity-50"
                            >
                                {generating ? "Generating..." : "Generate plan"}
                            </button>
                        </form>

                        <div className="space-y-1.5">
                            <p className="type-caption">Or try an example:</p>
                            {EXAMPLES.map((ex) => (
                                <button
                                    key={ex}
                                    type="button"
                                    onClick={() => { setInput(ex); run(ex); }}
                                    className="block w-full text-left text-sm text-[color:var(--color-nebula-fg-mute)] hover:text-[color:var(--color-accent-blue)] transition-colors"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: live output */}
                    <div className="lg:col-span-3 flex">
                        {!plan ? (
                            <div className="w-full rounded-2xl border border-dashed border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] p-8 flex flex-col justify-center space-y-5 min-h-[400px]">
                                <div className="flex items-center gap-3">
                                    <span className="h-3.5 w-3.5 rounded bg-[var(--color-nebula-hairline-strong)]" />
                                    <span className="h-2.5 w-40 rounded bg-[var(--color-nebula-hairline-strong)]" />
                                </div>
                                <div className="space-y-2.5">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--color-nebula-hairline)] bg-[var(--color-nebula-bg)] p-3">
                                            <span className="h-3 w-10 rounded bg-[var(--color-nebula-hairline-strong)]" />
                                            <span className="h-2 flex-1 rounded bg-[var(--color-nebula-hairline-strong)]" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="h-2.5 w-24 rounded bg-[var(--color-nebula-hairline-strong)]" />
                                    <span className="h-2.5 w-16 rounded bg-[var(--color-nebula-hairline-strong)]" />
                                </div>
                                <p className="type-small text-[color:var(--color-ash)] text-center pt-2">
                                    Your generated plan will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full space-y-4 flex flex-col justify-center">
                                {/*  */}
                                <div className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="type-h3">User stories</h3>
                                        <span className="nebula-pill">{plan.stories.length} stories</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {plan.stories.map((s) => (
                                            <li key={s.id} className="flex items-center gap-3 rounded-lg border border-[var(--color-nebula-hairline)] bg-[var(--color-surface-elevated)] p-3">
                                                <span className="font-mono text-xs text-[color:var(--color-accent-blue)]">{s.id}</span>
                                                <span className="flex-1 text-sm text-[color:var(--color-nebula-fg)]">{s.title}</span>
                                                <span className="text-xs text-[color:var(--color-ash)]">{s.tag}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] p-5">
                                        <h3 className="type-h3 mb-3">Architecture</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {plan.modules.map((m) => (
                                                <span key={m} className="rounded-full border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] px-3 py-1 text-xs font-medium text-[color:var(--color-nebula-fg-mute)]">
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] p-5">
                                        <h3 className="type-h3 mb-3">Backlog</h3>
                                        <ul className="space-y-2">
                                            {plan.tasks.map((t) => (
                                                <li key={t.title} className="flex items-center gap-3">
                                                    <span className={cn("h-3.5 w-3.5 rounded border", t.done ? "bg-[var(--color-accent-green)] border-[var(--color-accent-green)]" : "border-[var(--color-nebula-hairline-strong)]")} />
                                                    <span className="text-sm text-[color:var(--color-nebula-fg)]">{t.title}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
