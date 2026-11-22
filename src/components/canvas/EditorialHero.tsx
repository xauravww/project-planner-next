"use client";

import { NebulaButton } from "@/components/ui/NebulaButton";

export function EditorialHero() {
    return (
        <section className="relative overflow-hidden bg-[var(--color-nebula-bg)] border-b border-[var(--color-nebula-hairline)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[var(--color-accent-blue-glow)] to-transparent" />

            <div className="relative z-10 w-full container mx-auto px-6 max-w-[1200px] py-24 md:py-32">
                <div className="max-w-4xl space-y-8">
                    <p className="type-eyebrow">
                        AI project planning
                    </p>

                    <h1 className="type-display text-[color:var(--color-nebula-fg)]">
                        From one idea to a{" "}
                        <em className="type-italic-accent">shippable plan.</em>
                    </h1>

                    <p className="type-subtitle max-w-2xl text-lg">
                        Type a rough thought. NebulaPlan writes the user stories, maps the
                        architecture, and builds the backlog. Try it below, right on this page.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <NebulaButton href="/signup">
                            Get started free
                        </NebulaButton>
                        <NebulaButton href="#live" variant="ghost">
                            Try the live demo
                        </NebulaButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
