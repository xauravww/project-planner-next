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
        <section id="pricing" className="py-24 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                        Simple, Transparent <span className="text-gradient">Pricing</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your ambition. No hidden fees.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <GlassCard
                            key={index}
                            className={`relative flex flex-col p-8 ${plan.popular ? 'border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)]' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-4">{plan.description}</p>
                            </div>

                            <div className="flex-1 mb-8">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                            <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0' : 'bg-white/10 hover:bg-white/20 text-white border-0'}`}
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
