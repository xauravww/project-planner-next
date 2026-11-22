"use client";

import { Section, Container } from "@/components/ui/Section";

/**
 * Founder/origin section. 4/8 split — quiet label left, narrative right.
 * No cards. No grid. Editorial.
 */
export function Story() {
    return (
        <Section id="story" glow="orange" fill>
            <Container>
                <div className="grid md:grid-cols-12 gap-12 items-start">
                    <div className="hidden md:block md:col-span-5">
                        <div className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="h-3 w-24 rounded bg-[var(--color-nebula-hairline)]" />
                                <div className="h-6 w-6 rounded-full bg-[var(--color-accent-blue)] opacity-60" />
                            </div>
                            <div className="space-y-2">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="flex items-center gap-2.5 rounded-lg border border-[var(--color-nebula-hairline)] bg-[var(--color-nebula-bg)] p-2.5">
                                        <div className="h-3.5 w-3.5 shrink-0 rounded bg-[var(--color-accent-green)] opacity-60" />
                                        <div className="h-2 flex-1 rounded bg-[var(--color-nebula-hairline)]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4 space-y-2">
                        <p className="type-eyebrow">Why we built this</p>
                        <p className="type-small">A short note from the team.</p>
                    </div>

                    <div className="md:col-span-8 space-y-6">
                        <p className="type-h3">
                            Planning a project used to mean ten open tabs, three docs, and a
                            whiteboard photo nobody could read.
                        </p>
                        <p className="type-body-lg">
                            We were that team. Every Monday started with stitching ideas back
                            together. What was the scope again? Who said yes to that feature?
                            Where did the wireframe go?
                        </p>
                        <p className="type-body-lg">
                            So we built one place that holds it all. Drop in a rough idea and
                            NebulaPlan turns it into clear user stories, an architecture map,
                            and a backlog you can ship from. No lost context. No Monday
                            archaeology.
                        </p>
                        <p className="type-body-lg text-[color:var(--color-nebula-fg)]">
                            One home for the whole plan. That&rsquo;s the whole pitch.
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                            <span className="w-9 h-9 rounded-full nebula-hairline flex items-center justify-center text-xs font-medium text-[color:var(--color-nebula-fg)]">
                                SC
                            </span>
                            <div>
                                <p className="text-sm text-[color:var(--color-nebula-fg)]">Saurav &middot; Founder</p>
                                <p className="text-xs text-[color:var(--color-ash)]">NebulaPlan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
