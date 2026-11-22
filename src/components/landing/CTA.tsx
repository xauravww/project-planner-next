"use client";

import { Section, Container } from "@/components/ui/Section";
import { NebulaButton } from "@/components/ui/NebulaButton";

export function CTA() {
    return (
        <Section id="cta" glow="red" fill>
            <Container>
                <div className="space-y-10">
                    <div className="max-w-3xl space-y-6">
                        <h2 className="type-display-xl text-[color:var(--color-nebula-fg)]">
                            Ready to build the{" "}
                            <em className="type-italic-accent">next big thing?</em>
                        </h2>
                        <p className="type-subtitle max-w-xl">
                            Stop planning in scattered docs. Start building with one AI-powered home for your work.
                        </p>
                        <div className="flex pt-2">
                            <NebulaButton href="/signup">
                                Start planning free
                            </NebulaButton>
                        </div>
                    </div>

                    {/* visual */}
                    <div className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] p-6 grid sm:grid-cols-3 gap-4">
                        {[
                            { n: "1", label: "Drop your idea" },
                            { n: "2", label: "Get the plan" },
                            { n: "3", label: "Ship the work" },
                        ].map((s) => (
                            <div key={s.n} className="flex items-center gap-3 rounded-xl border border-[var(--color-nebula-hairline)] bg-[var(--color-nebula-bg)] p-4">
                                <div className="h-9 w-9 shrink-0 rounded-lg bg-[var(--color-accent-blue)] opacity-80 flex items-center justify-center text-sm font-bold text-[color:var(--color-on-light)]">
                                    {s.n}
                                </div>
                                <div className="h-2.5 flex-1 rounded bg-[var(--color-nebula-hairline)]" />
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </Section>
    );
}
