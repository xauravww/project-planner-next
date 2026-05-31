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
        price: "$0",
        period: "/ month",
        description: "Perfect for hobby projects and solo founders.",
        features: ["1 project", "Basic AI planning", "Standard export", "Community support"],
        cta: "Start free",
    },
    {
        name: "Pro",
        price: "$29",
        period: "/ month",
        description: "For serious builders shipping production apps.",
        features: ["Unlimited projects", "Advanced AI models", "Full code scaffolding", "Priority support", "Team collaboration"],
        cta: "Get Pro",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For larger teams that need more.",
        features: ["SSO & security", "Custom AI training", "Dedicated success manager", "SLA guarantee", "On-premise deploy"],
        cta: "Contact sales",
    },
];

export function Pricing() {
    return (
        <Section id="pricing">
            <Container>
                <SectionHeader
                    title="Simple, fair"
                    accent="pricing"
                    subtitle="Pick the plan that fits. No hidden fees, cancel anytime."
                />

                <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <NebulaCard
                            key={plan.name}
                            highlight={plan.popular}
                            className="h-full justify-between gap-8"
                        >
                            {plan.popular && (
                                <span
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[0.7rem] tracking-[0.32em] uppercase font-medium"
                                    style={{
                                        background: "var(--color-nebula-fg)",
                                        color: "var(--color-nebula-bg)",
                                    }}
                                >
                                    Most popular
                                </span>
                            )}

                            <div className="space-y-4">
                                <h3 className="type-h3">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="type-h2">{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-sm text-[color:var(--color-nebula-fg-mute)]">{plan.period}</span>
                                    )}
                                </div>
                                <p className="type-small">{plan.description}</p>
                            </div>

                            <ul className="space-y-3 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-[color:var(--color-nebula-fg-soft)]">
                                        <Check className="w-4 h-4 mt-0.5 text-[color:var(--color-nebula-fg)] shrink-0" />
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
