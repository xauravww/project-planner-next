"use client";

import { Section, Container, SectionHeader } from "@/components/ui/Section";

/**
 * Code-story split. Resend's signature rhythm:
 *   narrative copy on the left, code window on the right,
 *   stacking under 1024px (code well always second).
 */
export function Demo() {
    return (
        <Section id="demo" glow="blue" fill>
            <Container>
                <SectionHeader
                    title="Plan in plain English."
                    accent="Get back code."
                    subtitle="Describe what you want. NebulaPlan generates user stories, an architecture map, and tasks you can hand straight to your team."
                />

                <div className="grid lg:grid-cols-2 gap-[var(--space-xxl)] items-start lg:items-center min-w-0">
                    {/* narrative */}
                    <div className="space-y-[var(--space-xl)]">
                        {[
                            {
                                title: "One prompt, one plan",
                                body: "Drop in a one-liner. The AI returns a structured plan you can edit, share, and export.",
                            },
                            {
                                title: "Auto-architecture",
                                body: "We sketch the system diagram while you write: components, edges, data shapes.",
                            },
                            {
                                title: "Ship straight to your tools",
                                body: "Export tasks to Linear, Jira, or GitHub Issues. Or grab the scaffolding as code.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="space-y-2">
                                <h3 className="type-h3">{item.title}</h3>
                                <p className="type-body-lg">{item.body}</p>
                            </div>
                        ))}
                    </div>

                    {/* product screenshot */}
                    <div className="min-w-0">
                        <img
                            src="/product-dashboard.png"
                            alt="NebulaPlan dashboard preview"
                            className="w-full h-auto rounded-2xl border border-[var(--color-nebula-hairline-strong)] shadow-2xl"
                            loading="lazy"
                        />
                    </div>
                </div>
            </Container>
        </Section>
    );
}
