"use client";

import { motion } from "framer-motion";
import { Section, Container, SectionHeader } from "@/components/ui/Section";
import { BrowserMock } from "@/components/ui/BrowserMock";

type Callout = { x: string; y: string; label: string; copy: string };

// Positions are % so they scale with the mock at every breakpoint.
const CALLOUTS: Callout[] = [
    { x: "8%",  y: "18%", label: "01", copy: "Type your idea. AI drafts user stories." },
    { x: "62%", y: "44%", label: "02", copy: "Architecture map updates as you write." },
    { x: "26%", y: "78%", label: "03", copy: "Export tasks straight to Linear or Jira." },
];

export function Demo() {
    return (
        <Section id="demo">
            <Container>
                <SectionHeader
                    title="See it"
                    accent="in motion"
                    subtitle="A real look at how NebulaPlan turns a rough idea into a working plan."
                />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="relative max-w-5xl mx-auto"
                >
                    <BrowserMock url="nebulaplan.app / project / aurora">
                        {/* faux product surface */}
                        <div className="relative aspect-[16/10] grid grid-cols-12 gap-3 p-4">
                            {/* sidebar */}
                            <aside className="col-span-3 nebula-surface !rounded-[var(--nebula-radius-md)] !p-3 space-y-2">
                                <div className="h-3 w-2/3 rounded bg-[var(--color-nebula-fg)]/20" />
                                {[0.9, 0.7, 0.55, 0.6, 0.5].map((w, k) => (
                                    <div
                                        key={k}
                                        className="h-2.5 rounded bg-[var(--color-nebula-hairline-strong)]"
                                        style={{ width: `${w * 100}%` }}
                                    />
                                ))}
                                <div className="h-px my-3 bg-[var(--color-nebula-hairline)]" />
                                {[0.8, 0.6, 0.7].map((w, k) => (
                                    <div
                                        key={k}
                                        className="h-2.5 rounded bg-[var(--color-nebula-hairline)]"
                                        style={{ width: `${w * 100}%` }}
                                    />
                                ))}
                            </aside>

                            {/* main pane */}
                            <main className="col-span-9 space-y-3">
                                {/* prompt input */}
                                <div className="nebula-surface !rounded-[var(--nebula-radius-md)] !p-3">
                                    <p className="text-xs font-mono text-[color:var(--color-nebula-fg-soft)] truncate">
                                        Build a saas for indie founders to plan launches.
                                    </p>
                                </div>

                                {/* output blocks — story + arch */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="nebula-surface !rounded-[var(--nebula-radius-md)] !p-3 space-y-2">
                                        <div className="h-2.5 w-1/3 rounded bg-[var(--color-nebula-fg)]/30" />
                                        {[0.95, 0.8, 0.9, 0.7].map((w, k) => (
                                            <div
                                                key={k}
                                                className="h-2 rounded bg-[var(--color-nebula-hairline-strong)]"
                                                style={{ width: `${w * 100}%` }}
                                            />
                                        ))}
                                    </div>

                                    <div className="nebula-surface !rounded-[var(--nebula-radius-md)] !p-3">
                                        {/* mini arch graph */}
                                        <svg viewBox="0 0 120 70" className="w-full h-full">
                                            <g stroke="var(--color-nebula-hairline-strong)" strokeDasharray="2 3" fill="none">
                                                <line x1="60" y1="14" x2="60" y2="32" />
                                                <line x1="60" y1="42" x2="30" y2="58" />
                                                <line x1="60" y1="42" x2="90" y2="58" />
                                            </g>
                                            {[
                                                { x: 45, y: 6, w: 30, h: 12, t: "Client" },
                                                { x: 45, y: 30, w: 30, h: 12, t: "API" },
                                                { x: 15, y: 54, w: 26, h: 12, t: "Auth" },
                                                { x: 79, y: 54, w: 26, h: 12, t: "DB" },
                                            ].map((n) => (
                                                <g key={n.t}>
                                                    <rect
                                                        x={n.x} y={n.y} width={n.w} height={n.h} rx={2}
                                                        fill="var(--color-nebula-surface)"
                                                        stroke="var(--color-nebula-hairline-strong)"
                                                    />
                                                    <text
                                                        x={n.x + n.w / 2} y={n.y + n.h / 2 + 2.5}
                                                        textAnchor="middle"
                                                        fontSize="5"
                                                        fontFamily="ui-monospace, monospace"
                                                        fill="var(--color-nebula-fg)"
                                                    >
                                                        {n.t}
                                                    </text>
                                                </g>
                                            ))}
                                        </svg>
                                    </div>
                                </div>

                                {/* backlog rows */}
                                <div className="nebula-surface !rounded-[var(--nebula-radius-md)] !p-3 space-y-2">
                                    {["Auth flow", "Onboarding screen", "Billing webhook"].map((row, k) => (
                                        <div key={row} className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono text-[color:var(--color-nebula-fg-mute)]">{`T-${k + 1}`}</span>
                                            <div className="flex-1 h-2 rounded bg-[var(--color-nebula-hairline-strong)]" />
                                            <span className="text-[10px] font-mono text-[color:var(--color-nebula-fg-soft)]">{row}</span>
                                        </div>
                                    ))}
                                </div>
                            </main>

                            {/* callouts overlaid on the mock */}
                            {CALLOUTS.map((c, i) => (
                                <motion.div
                                    key={c.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
                                    className="absolute hidden md:flex items-center gap-2 pointer-events-none"
                                    style={{ left: c.x, top: c.y }}
                                >
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-nebula-fg)] text-[var(--color-nebula-bg)] text-[10px] font-mono font-semibold shadow-lg">
                                        {c.label}
                                    </span>
                                    <span className="bg-[var(--color-nebula-bg)] nebula-hairline rounded-md px-2.5 py-1 text-xs text-[color:var(--color-nebula-fg-soft)] whitespace-nowrap">
                                        {c.copy}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </BrowserMock>

                    {/* glow under the mock */}
                    <div
                        aria-hidden
                        className="absolute -inset-x-10 -bottom-10 h-32 -z-10 blur-3xl"
                        style={{
                            background:
                                "radial-gradient(50% 60% at 50% 50%, var(--color-nebula-glow) 0%, transparent 70%)",
                        }}
                    />
                </motion.div>

                {/* callout legend on mobile */}
                <div className="md:hidden grid grid-cols-1 gap-3 mt-8 max-w-md mx-auto">
                    {CALLOUTS.map((c) => (
                        <div key={c.label} className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-nebula-fg)] text-[var(--color-nebula-bg)] text-[10px] font-mono font-semibold shrink-0">
                                {c.label}
                            </span>
                            <p className="type-small">{c.copy}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
