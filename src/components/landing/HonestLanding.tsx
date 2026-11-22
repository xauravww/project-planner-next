"use client";

import { NebulaButton } from "@/components/ui/NebulaButton";

const steps = [
    {
        n: "1",
        title: "Describe the project",
        body: "Create a project and write what you're building in plain words.",
    },
    {
        n: "2",
        title: "AI structures it",
        body: "NebulaPlan generates user stories, an architecture map, and tasks.",
    },
    {
        n: "3",
        title: "Review and ship",
        body: "Refine the plan, share it with your team, and export the backlog.",
    },
];

const features = [
    "AI-generated user stories",
    "Architecture and high-level design",
    "Task backlog with exports",
    "Team collaboration",
];

export function HonestLanding() {
    return (
        <>
            {/* Hero */}
            <section className="relative overflow-hidden bg-[var(--color-nebula-bg)] border-b border-[var(--color-nebula-hairline)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[var(--color-accent-blue-glow)] to-transparent" />
                <div className="relative z-10 w-full container mx-auto px-6 max-w-[1200px] py-24 md:py-28">
                    <div className="max-w-3xl space-y-8">
                        <h1 className="type-display text-[color:var(--color-nebula-fg)]">
                            Turn an idea into a{" "}
                            <em className="type-italic-accent">working plan.</em>
                        </h1>
                        <p className="type-subtitle max-w-2xl text-lg">
                            NebulaPlan is an AI project planning app. Describe what you want to
                            build, and it writes the user stories, maps the architecture, and
                            builds the backlog. No templates, no filler.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <NebulaButton href="/signup">
                                Get started free
                            </NebulaButton>
                            <NebulaButton href="/login" variant="ghost">
                                Sign in
                            </NebulaButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section>
                <div className="w-full container mx-auto px-6 max-w-[1200px] py-20">
                    <div className="grid md:grid-cols-3 gap-10">
                        {steps.map((s) => (
                            <div key={s.n}>
                                <div className="text-xs font-semibold text-[color:var(--color-accent-blue)] mb-3">
                                    Step {s.n}
                                </div>
                                <h3 className="type-h3 mb-2">{s.title}</h3>
                                <p className="type-small text-[color:var(--color-nebula-fg-mute)]">
                                    {s.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="border-t border-[var(--color-nebula-hairline)]">
                <div className="w-full container mx-auto px-6 max-w-[1200px] py-20">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((f) => (
                            <div key={f} className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] p-5">
                                <p className="type-small text-[color:var(--color-nebula-fg)]">{f}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
