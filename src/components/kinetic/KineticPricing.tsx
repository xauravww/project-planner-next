"use client";

import Link from "next/link";

const PLANS = [
    {
        name: "Free",
        price: "$0",
        oldPrice: null,
        period: "free forever",
        features: ["1 active project", "AI requirements & stories", "Architecture view", "Export backlog"],
        cta: "Start free",
        dark: false,
    },
    {
        name: "Pro",
        price: "$0",
        oldPrice: "$19",
        period: "for a limited time",
        badge: "Limited time",
        features: ["Unlimited projects", "All AI modules", "Team collaboration", "Priority generation"],
        cta: "Go Pro",
        dark: true,
    },
];

export function KineticPricing() {
    return (
        <section id="pricing" className="bg-white pt-16 pb-10">
            <div className="container mx-auto px-4 max-w-[1400px]">
                <div className="mb-10 border-b-2 border-black pb-4">
                    <h2 className="type-display-xl text-[length:clamp(2rem,7vw,5rem)]">Pricing</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col border-2 p-6 ${
                                plan.dark ? "border-white bg-black text-white" : "border-black bg-white text-black"
                            }`}
                        >
                            {plan.badge && (
                                <span className="absolute -top-3 right-6 -rotate-2 border-2 border-black bg-[#FF4D00] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-tight text-black">
                                    {plan.badge}
                                </span>
                            )}

                            <div className="flex items-baseline justify-between">
                                <h3 className="type-h3">{plan.name}</h3>
                                <div className="text-right">
                                    <div className={`flex items-baseline justify-end gap-2 ${
                                        plan.dark ? "text-white" : "text-black"
                                    }`}>
                                        {plan.oldPrice && (
                                            <span className={`text-lg line-through ${plan.dark ? "text-white/40" : "text-black/40"}`}>
                                                {plan.oldPrice}
                                            </span>
                                        )}
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                    </div>
                                    <div className={`font-mono text-[11px] uppercase tracking-tight ${plan.dark ? "text-white/60" : "text-black/50"}`}>
                                        {plan.period}
                                    </div>
                                </div>
                            </div>

                            <ul className="mt-5 flex-1 space-y-2">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm">
                                        <span className={`h-1.5 w-1.5 ${plan.dark ? "bg-[#FF4D00]" : "bg-black"}`} />
                                        <span className={plan.dark ? "text-white/80" : "text-black/70"}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className={`mt-6 inline-flex items-center justify-center border-2 px-5 py-3 font-mono text-sm uppercase tracking-tight transition-colors ${
                                    plan.dark
                                        ? "border-white bg-white text-black hover:bg-[#FF4D00] hover:border-[#FF4D00] hover:text-black"
                                        : "border-black bg-black text-white hover:bg-[#FF4D00] hover:border-[#FF4D00]"
                                }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
