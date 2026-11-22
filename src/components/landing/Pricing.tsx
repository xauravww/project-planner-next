"use client";

import { Check } from "lucide-react";
import { Section, Container, SectionHeader } from "@/components/ui/Section";
import { NebulaCard } from "@/components/ui/NebulaCard";
import { NebulaButton } from "@/components/ui/NebulaButton";

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
        <Section id="pricing" fill>
            <Container>
                <SectionHeader
                    title="Simple, fair"
                    accent="pricing"
                    subtitle="Everything is FREE for a limited time during our launch. No credit card required."
                />

                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-2 rounded-full border border-[var(--color-accent-blue)] bg-[var(--color-accent-blue-glow)] text-sm font-medium text-[color:var(--color-accent-blue)]">
                        Limited time offer. Regular pricing starts soon
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
                                        background: "var(--color-accent-blue)",
                                        color: "var(--color-on-light)",
                                        borderColor: "var(--color-accent-blue)",
                                    }}
                                >
                                    Recommended
                                </span>
                            )}

                            <div className="space-y-3">
                                <h3 className="type-h3">{plan.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className="text-[color:var(--color-nebula-fg)]"
                                        style={{
                                            fontFamily: "var(--font-sans), 'Inter', sans-serif",
                                            fontSize: "var(--nebula-display-lg)",
                                            fontWeight: 600,
                                            lineHeight: 1,
                                            letterSpacing: "-0.02em",
                                        }}
                                    >
                                        {plan.price}
                                    </span>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full text-[color:var(--color-accent-blue)] bg-[var(--color-accent-blue-glow)]">
                                        Limited time
                                    </span>
                                </div>
                                <p className="type-body">{plan.description}</p>
                            </div>

                            <ul className="space-y-3 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 type-small text-[color:var(--color-nebula-fg-soft)]">
                                        <Check className="w-4 h-4 mt-0.5 text-[color:var(--color-accent-blue)] shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <NebulaButton
                                href="/signup"
                                variant={plan.popular ? "primary" : "ghost"}
                                className="w-full"
                            >
                                {plan.cta}
                            </NebulaButton>
                        </NebulaCard>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
