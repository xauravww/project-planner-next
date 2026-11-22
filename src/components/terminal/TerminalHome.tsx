"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Kind = "cmd" | "out" | "info" | "dim";
type Line = { kind: Kind; text: string };

const BOOT = [
    { kind: "dim", text: "NebulaPlan CLI v0.2.0" },
    { kind: "dim", text: "Type `plan \"your idea\"` to generate a plan." },
    { kind: "dim", text: "Type `help` for commands." },
    { kind: "out", text: "" },
    { kind: "out", text: "await plan({ idea: \"a mobile app\" })" },
    { kind: "out", text: "  → user stories   [4]" },
    { kind: "out", text: "  → architecture    [5 modules]" },
    { kind: "out", text: "  → backlog         [4 tasks]" },
] as Line[];

function buildPlan(idea: string): Line[] {
    const title = idea.trim() || "your idea";
    const noun = title.split(" ").slice(0, 5).join(" ");
    return [
        { kind: "info", text: `→ parsing brief: "${title}"` },
        { kind: "out", text: "" },
        { kind: "out", text: "USER STORIES" },
        { kind: "out", text: "  S-01  A user signs up and creates a project for " + noun },
        { kind: "out", text: "  S-02  Owner describes the scope in plain text" },
        { kind: "out", text: "  S-03  Team sees stories, architecture, backlog in one view" },
        { kind: "out", text: "  S-04  Owner exports tasks to Linear or GitHub Issues" },
        { kind: "out", text: "" },
        { kind: "out", text: "ARCHITECTURE" },
        { kind: "out", text: "  Auth, Projects, Plan engine, Export, Notifications" },
        { kind: "out", text: "" },
        { kind: "out", text: "BACKLOG" },
        { kind: "out", text: "  [x] Initialize project schema" },
        { kind: "out", text: "  [x] Build the plan editor" },
        { kind: "out", text: "  [ ] Wire AI generation" },
        { kind: "out", text: "  [ ] Add Linear export" },
        { kind: "out", text: "" },
        { kind: "dim", text: "Saved as draft. Sign up to keep it." },
    ];
}

const HELP = [
    { kind: "dim", text: "commands:" },
    { kind: "out", text: "  plan \"<idea>\"   generate a plan from a brief" },
    { kind: "out", text: "  help            show this help" },
    { kind: "out", text: "  clear           clear the screen" },
] as Line[];

const EXAMPLES = [
    "a mobile app for splitting rent with roommates",
    "a booking tool for small music venues",
    "a time tracker for freelance designers",
];

export function TerminalHome() {
    const [lines, setLines] = useState<Line[]>(BOOT);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const bodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
    }, [lines]);

    const push = (next: Line[], append: Line[] = []) => setLines((prev) => [...prev, ...next, ...append]);

    const run = (raw: string) => {
        const cmd = raw.trim();
        if (!cmd || busy) return;

        push([{ kind: "cmd", text: cmd }]);

        if (cmd === "help") {
            push(HELP);
        } else if (cmd === "clear") {
            setLines([]);
        } else if (cmd.startsWith("plan ")) {
            const idea = cmd.slice(5).replace(/^"|"$/g, "").trim();
            if (!idea) {
                push([{ kind: "info", text: 'usage: plan "<idea>"' }]);
                return;
            }
            setBusy(true);
            setTimeout(() => {
                push(buildPlan(idea));
                setBusy(false);
            }, 500);
        } else {
            push([
                { kind: "info", text: `unknown command: ${cmd}` },
                { kind: "dim", text: 'try `plan "an idea"` or `help`' },
            ]);
        }
    };

    return (
        <section className="relative min-h-[calc(100svh)] flex flex-col justify-center overflow-hidden bg-[var(--color-nebula-bg)] pt-16">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--color-accent-blue-glow)] to-transparent" />

            <div className="relative z-10 w-full container mx-auto px-6 max-w-[1200px] py-12">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="type-display-xl text-[color:var(--color-nebula-fg)]">
                            Plan projects from the command line.
                        </h1>
                        <p className="type-subtitle max-w-xl mx-auto">
                            This page is a real terminal. Run a command and watch a plan generate.
                        </p>
                    </div>

                    {/* terminal window */}
                    <div className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-deep)] shadow-2xl overflow-hidden">
                        {/* title bar */}
                        <div className="flex items-center gap-2 px-4 h-10 border-b border-[var(--color-nebula-hairline)] bg-[var(--color-surface-elevated)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-red)] opacity-70" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-yellow)] opacity-70" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-green)] opacity-70" />
                            <span className="ml-3 text-xs font-mono text-[color:var(--color-ash)]">
                                nebulaplan — zsh
                            </span>
                        </div>

                        {/* body */}
                        <div ref={bodyRef} className="h-[420px] overflow-y-auto p-5 font-mono text-[14px] leading-relaxed space-y-1">
                            {lines.map((l, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "whitespace-pre-wrap",
                                        l.kind === "cmd" && "text-[color:var(--color-accent-blue)]",
                                        l.kind === "info" && "text-[color:var(--color-nebula-fg)]",
                                        l.kind === "out" && "text-[color:var(--color-nebula-fg-soft)]",
                                        l.kind === "dim" && "text-[color:var(--color-nebula-fg-mute)]",
                                    )}
                                >
                                    {l.kind === "cmd" ? (
                                        <span>
                                            <span className="text-[color:var(--color-accent-green)]">➜</span>{" "}
                                            <span className="text-[color:var(--color-accent-blue)]">~</span> <span>{l.text}</span>
                                        </span>
                                    ) : (
                                        l.text
                                    )}
                                </div>
                            ))}
                            {busy && (
                                <div className="text-[color:var(--color-ash)]">generating…</div>
                            )}
                        </div>

                        {/* input row */}
                        <form
                            onSubmit={(e) => { e.preventDefault(); run(input); setInput(""); }}
                            className="flex items-center gap-2 border-t border-[var(--color-nebula-hairline)] bg-[var(--color-surface-elevated)] px-4 py-3"
                        >
                            <span className="font-mono text-[color:var(--color-accent-green)]">➜</span>
                            <span className="font-mono text-[color:var(--color-accent-blue)]">~</span>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder='plan "an idea for a product"'
                                autoFocus
                                className="flex-1 bg-transparent outline-none font-mono text-[13px] text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-stone)]"
                            />
                            <button type="submit" className="nebula-btn nebula-btn--primary h-8 px-3 text-xs">
                                Run
                            </button>
                        </form>
                    </div>

                    {/* example commands */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {EXAMPLES.map((ex) => (
                            <button
                                key={ex}
                                type="button"
                                onClick={() => { setInput(`plan "${ex}"`); run(`plan "${ex}"`); }}
                                className="font-mono text-xs px-3 py-1.5 rounded-full border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] text-[color:var(--color-nebula-fg-mute)] hover:text-[color:var(--color-accent-blue)] transition-colors max-w-full"
                            >
                                plan "{ex}"
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
