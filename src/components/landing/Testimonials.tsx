"use client";

import { motion } from "framer-motion";
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
            "NebulaPlan changed how we handle requirements. The AI suggestions are sharp and saved us weeks of planning — we went from messy docs to a shippable plan in one afternoon.",
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
        <Section id="testimonials" glow="yellow">
            <Container className="max-w-5xl">
                {/* Hero quote — no card, big serif, editorial */}
                <motion.figure
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-20 max-w-3xl"
                >
                    <span
                        aria-hidden
                        className="block text-[color:var(--color-nebula-fg)] leading-none mb-2"
                        style={{
                            fontFamily: "var(--font-serif), serif",
                            fontSize: "5rem",
                            fontStyle: "italic",
                            opacity: 0.4,
                        }}
                    >
                        &ldquo;
                    </span>
                    <blockquote
                        className="text-[color:var(--color-nebula-fg)]"
                        style={{
                            fontFamily: "var(--font-serif), serif",
                            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                            fontWeight: 400,
                            lineHeight: 1.3,
                            letterSpacing: "-0.01em",
                        }}
                    >
                        {hero.content}
                    </blockquote>
                    <figcaption className="mt-6">
                        <Author t={hero} size="lg" />
                    </figcaption>
                </motion.figure>

                {/* small row — quieter cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {rest.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                        >
                            <NebulaCard className="h-full gap-5 !p-6">
                                <p className="type-small italic">&ldquo;{t.content}&rdquo;</p>
                                <Author t={t} />
                            </NebulaCard>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
