"use client";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        price: "$0",
        description: "Perfect for hobby projects and solo founders.",
        features: ["1 Project", "Basic AI Planning", "Standard Export", "Community Support"],
        cta: "Start Free",
        popular: false,
    },
    {
        name: "Pro",
        price: "$29",
        description: "For serious builders shipping production apps.",
        features: ["Unlimited Projects", "Advanced AI Models", "Full Code Scaffolding", "Priority Support", "Team Collaboration"],
        cta: "Get Pro",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "Tailored solutions for large organizations.",
        features: ["SSO & Security", "Custom AI Training", "Dedicated Success Manager", "SLA Guarantee", "On-premise Deployment"],
        cta: "Contact Sales",
        popular: false,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 relative bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4 tracking-tight">
                        Simple, Transparent <span className="text-white">Pricing</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Choose the plan that fits your ambition. No hidden fees.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <GlassCard
                            key={index}
                            className={`relative flex flex-col p-8 transition-colors ${plan.popular ? 'bg-zinc-900 border-zinc-700' : 'bg-black border-zinc-800 hover:border-zinc-700'}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full border border-white">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    {plan.price !== "Custom" && <span className="text-zinc-500">/month</span>}
                                </div>
                                <p className="text-sm text-zinc-400 mt-4">{plan.description}</p>
                            </div>

                            <div className="flex-1 mb-8">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                            <Check className="w-5 h-5 text-zinc-100 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                className={`w-full ${plan.popular ? 'bg-white hover:bg-zinc-200 text-black border-0' : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700'}`}
                            >
                                {plan.cta}
                            </Button>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
