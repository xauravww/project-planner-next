"use client";

import { NebulaButton } from "@/components/ui/NebulaButton";

export function KineticHero() {
    return (
        <section className="relative overflow-hidden bg-white pt-24 pb-16 md:pt-36 md:pb-24">
            <div className="container mx-auto px-4 max-w-[1400px]">
                <h1 className="type-display text-[length:clamp(2.25rem,10.5vw,10rem)] leading-[0.9] text-center">
                    New idea
                    <br />
                    You thought
                    <br />
                    We plan
                </h1>

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
