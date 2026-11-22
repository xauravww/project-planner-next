"use client";

import { Section, Container } from "@/components/ui/Section";
import { NebulaCard } from "@/components/ui/NebulaCard";

type Testimonial = {
    name: string;
    role: string;
    content: string;
    avatar: string;
};

// First entry = hero quote; rest = small row below.
const testimonials: Testimonial[] = [
    {
        name: "Sarah Chen",
        role: "Senior Product Manager",
        content:
            "NebulaPlan changed how we handle requirements. The AI suggestions are sharp and saved us weeks of planning. We went from messy docs to a shippable plan in one afternoon.",
        avatar: "SC",
    },
    {
        name: "Marcus Rodriguez",
        role: "Tech Lead",
        content: "Finally bridges PMs and devs. The architecture diagrams alone are a lifesaver.",
        avatar: "MR",
    },
    {
        name: "Emily Wright",
        role: "Startup Founder",
        content: "We went from idea to MVP in half the time. Like having a CTO in your pocket.",
        avatar: "EW",
    },
    {
        name: "Aarav Patel",
        role: "Solo Founder",
        content: "Cut my planning time in half. The Linear export alone is worth the price.",
        avatar: "AP",
    },
];

function Author({ t, size = "sm" }: { t: Testimonial; size?: "sm" | "lg" }) {
    const dim = size === "lg" ? "w-12 h-12 text-sm" : "w-9 h-9 text-xs";
    return (
        <div className="flex items-center gap-3">
            <span className={`${dim} rounded-full nebula-hairline flex items-center justify-center font-medium text-[color:var(--color-nebula-fg)]`}>
                {t.avatar}
            </span>
            <div>
                <p className="text-sm text-[color:var(--color-nebula-fg)]">{t.name}</p>
                <p className="text-xs text-[color:var(--color-nebula-fg-mute)]">{t.role}</p>
            </div>
        </div>
    );
}

export function Testimonials() {
    const [hero, ...rest] = testimonials;

    return (
        <Section id="testimonials" glow="yellow" fill>
            <Container>
                {/* Hero quote + visual split */}
                <div className="grid lg:grid-cols-5 gap-12 items-center">
                    <figure className="lg:col-span-3 mb-0">
                        <span
                            aria-hidden
                            className="block text-[color:var(--color-accent-blue)] leading-none mb-2"
                            style={{
                                fontFamily: "var(--font-sans), 'Inter', sans-serif",
                                fontSize: "4rem",
                                fontWeight: 700,
                                opacity: 0.35,
                            }}
                        >
                            &ldquo;
                        </span>
                        <blockquote
                            className="text-[color:var(--color-nebula-fg)]"
                            style={{
                                fontFamily: "var(--font-sans), 'Inter', sans-serif",
                                fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                                fontWeight: 500,
                                lineHeight: 1.35,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {hero.content}
                        </blockquote>
                        <figcaption className="mt-6">
                            <Author t={hero} size="lg" />
                        </figcaption>
                    </figure>

                    <div className="hidden lg:block lg:col-span-2">
                        <img
                            src="/product-plans.png"
                            alt="NebulaPlan planning board"
                            className="w-full h-auto rounded-2xl border border-[var(--color-nebula-hairline-strong)] shadow-2xl"
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* small row — quieter cards */}
                <div className="grid gap-4 mt-16 md:grid-cols-3">
                    {rest.map((t) => (
                        <div key={t.name}>
                            <NebulaCard className="h-full gap-5 !p-6">
                                <p className="type-small italic">&ldquo;{t.content}&rdquo;</p>
                                <Author t={t} />
                            </NebulaCard>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
