"use client";

import { NebulaButton } from "@/components/ui/NebulaButton";

export function KineticHero() {
    return (
        <section className="relative overflow-hidden bg-white pt-24 pb-16 md:pt-36 md:pb-24">
            <div className="container mx-auto px-4 max-w-[1400px] text-center">
                <h1 className="type-display text-[length:clamp(2.5rem,6vw,6rem)] leading-[0.95]">
                    We plan it
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-lg md:text-xl leading-relaxed text-black/80">
                    Tell us your idea in plain words. NebulaPlan turns it into user
                    stories, an architecture map, and a task backlog.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <NebulaButton href="/signup" size="lg">
                        Get started free
                    </NebulaButton>
                    <NebulaButton href="/login" variant="ghost" size="lg">
                        Sign in
                    </NebulaButton>
                </div>
            </div>
        </section>
    );
}
