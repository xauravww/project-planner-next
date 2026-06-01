"use client";

import { Check } from "lucide-react";
import { Section, Container, SectionHeader } from "@/components/ui/Section";
import { NebulaCard } from "@/components/ui/NebulaCard";

type Plan = {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    cta: string;
    popular?: boolean;
};

const plans: Plan[] = [
    {
        name: "Starter",
        price: "FREE",
        period: "",
        description: "Perfect for hobby projects and solo founders.",
        features: ["1 project", "Basic AI planning", "Standard export", "Community support"],
        cta: "Get started",
    },
    {
        name: "Pro",
        price: "FREE",
        period: "",
        description: "For serious builders shipping production apps.",
        features: ["Unlimited projects", "Advanced AI models", "Full code scaffolding", "Priority support", "Team collaboration"],
        cta: "Get started",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "FREE",
        period: "",
        description: "For larger teams that need more.",
        features: ["SSO & security", "Custom AI training", "Dedicated success manager", "SLA guarantee", "On-premise deploy"],
        cta: "Get started",
    },
];

export function Pricing() {
    return (
        <Section id="pricing">
            <Container>
                <SectionHeader
                    title="Simple, fair"
                    accent="pricing"
                    subtitle="Everything is FREE for a limited time during our launch. No credit card required."
                />

                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-sm font-medium">
                        Limited time offer — Regular pricing starts soon
                    </span>
                </div>

                <div className="grid gap-[var(--space-xl)] lg:grid-cols-3 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <NebulaCard
                            key={plan.name}
                            variant={plan.popular ? "elevated" : "default"}
                            className="h-full justify-between gap-[var(--space-xl)]"
                        >
                            {plan.popular && (
                                <span
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 nebula-pill"
                                    style={{
                                        background: "var(--color-accent-green)",
                                        color: "var(--color-nebula-bg)",
                                        borderColor: "var(--color-accent-green)",
                                    }}
                                >
                                    Recommended
                                </span>
                            )}

                            <div className="space-y-3">
                                <h3 className="type-h3">{plan.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className="text-[color:var(--color-accent-green)]"
                                        style={{
                                            fontFamily: "var(--font-serif), serif",
                                            fontSize: "var(--nebula-display-lg)",
                                            lineHeight: 1,
                                            letterSpacing: "-0.02em",
                                        }}
                                    >
                                        {plan.price}
                                    </span>
                                    <span className="text-xs text-amber-300/80 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">
                                        Limited time
                                    </span>
                                </div>
                                <p className="type-body">{plan.description}</p>
                            </div>

                            <ul className="space-y-3 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 type-small text-[color:var(--color-nebula-fg-soft)]">
                                        <Check className="w-4 h-4 mt-0.5 text-[color:var(--color-accent-green)] shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="/signup"
                                className={`nebula-btn ${plan.popular ? "nebula-btn--primary" : "nebula-btn--ghost"} justify-center w-full`}
                            >
                                {plan.cta}
                            </a>
                        </NebulaCard>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
