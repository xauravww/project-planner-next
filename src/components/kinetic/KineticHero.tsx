"use client";

import { NebulaButton } from "@/components/ui/NebulaButton";

function HeroAppFrame() {
    return (
        <div className="mx-auto mt-12 w-full max-w-4xl text-left">
            <div className="border-2 border-black bg-white">
                {/* window chrome */}
                <div className="flex items-center justify-between border-b-2 border-black px-4 py-2">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 bg-[#FF4D00]" />
                        <span className="h-2.5 w-2.5 bg-black" />
                        <span className="h-2.5 w-2.5 bg-black/40" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-tight text-black/50">
                        NebulaPlan · Plan view
                    </span>
                </div>

                <div className="grid grid-cols-12">
                    {/* sidebar — stacks as a top bar on mobile */}
                    <div className="col-span-12 border-b-2 border-black p-3 sm:col-span-3 sm:border-b-0 sm:border-r-2">
                        <div className="mb-2 font-mono text-[10px] uppercase tracking-tight text-black/50 sm:mb-3">Menu</div>
                        <div className="flex flex-wrap gap-1.5 sm:block sm:space-y-1.5">
                            {["Dashboard", "Requirements", "Stories", "Architecture"].map((l, i) => (
                                <div
                                    key={l}
                                    className={`border border-black px-2 py-1 text-[11px] font-semibold ${
                                        i === 0 ? "bg-black text-white" : "text-black"
                                    }`}
                                >
                                    {l}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* content */}
                    <div className="col-span-12 min-w-0 p-4 sm:col-span-9">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase tracking-tight text-black/50">Requirements · 4</span>
                            <span className="border border-black px-2 py-0.5 font-mono text-[10px] uppercase tracking-tight text-black">
                                Add
                            </span>
                        </div>
                        <div className="mt-3 space-y-2">
                            {[
                                { t: "User authentication", n: "01", tag: "Functional" },
                                { t: "Secure payments", n: "02", tag: "Functional" },
                                { t: "Fast loading", n: "03", tag: "Non-functional" },
                            ].map((r) => (
                                <div key={r.n} className="flex items-center gap-2 border border-black px-2 py-2 sm:gap-3 sm:px-3">
                                    <span className="font-mono text-[10px] text-[#FF4D00]">{r.n}</span>
                                    <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-black">{r.t}</span>
                                    <span className="hidden shrink-0 border border-black px-2 py-0.5 font-mono text-[9px] uppercase tracking-tight text-black/70 sm:inline">
                                        {r.tag}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function KineticHero() {
    return (
        <section className="relative overflow-hidden bg-white pt-24 pb-10 md:pt-32 md:pb-14">
            <div className="container mx-auto px-4 max-w-[1400px] text-center">
                <h1 className="type-display animate-hero-enter text-[length:clamp(2.5rem,6vw,6rem)] leading-[0.95]">
                    We plan it
                </h1>

                <p className="mx-auto mt-6 max-w-xl animate-hero-enter text-lg md:text-xl leading-relaxed text-black/80" style={{ animationDelay: "0.08s" }}>
                    Tell us your idea in plain words. NebulaPlan turns it into user
                    stories, an architecture map, and a task backlog.
                </p>

                <div className="animate-hero-enter mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "0.16s" }}>
                    <NebulaButton href="/signup" size="lg">
                        Get started free
                    </NebulaButton>
                    <NebulaButton href="/login" variant="ghost" size="lg">
                        Sign in
                    </NebulaButton>
                </div>

                <div className="animate-hero-enter" style={{ animationDelay: "0.24s" }}>
                    <HeroAppFrame />
                </div>
            </div>
        </section>
    );
}
