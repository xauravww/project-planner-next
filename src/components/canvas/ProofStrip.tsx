"use client";

/**
 * Quiet credibility strip. Minimal, no hype.
 */
const stats = [
    { value: "4 steps", label: "idea to shippable backlog" },
    { value: "1 tool", label: "stories, architecture, tasks" },
    { value: "0 setup", label: "no templates, no clutter" },
];

export function ProofStrip() {
    return (
        <section className="border-b border-[var(--color-nebula-hairline)]">
            <div className="w-full container mx-auto px-6 max-w-[1200px] py-12">
                <dl className="grid sm:grid-cols-3 gap-8">
                    {stats.map((s) => (
                        <div key={s.label}>
                            <dt className="type-display-xl text-[color:var(--color-nebula-fg)]">
                                {s.value}
                            </dt>
                            <dd className="type-small text-[color:var(--color-nebula-fg-mute)] mt-1">
                                {s.label}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
