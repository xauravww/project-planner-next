"use client";

import { motion } from "framer-motion";
import { Layers, Zap, Shield, Globe, Cpu, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import AetherBackground from "@/components/ui/aether-background";

const features = [
    {
        title: "Modular Architecture",
        description: "Build scalable systems with our intuitive module planning tools. Drag, drop, and connect components.",
        icon: Layers,
        className: "md:col-span-2 md:row-span-2",
    },
    {
        title: "Edge Optimized",
        description: "Zero-latency planning.",
        icon: Zap,
        className: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Global Sync",
        description: "Real-time collaboration across the globe.",
        icon: Globe,
        className: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Enterprise Security",
        description: "Bank-grade encryption for your IP.",
        icon: Shield,
        className: "md:col-span-1 md:row-span-1",
    },
    {
        title: "AI Powered",
        description: "Generative suggestions for your tech stack.",
        icon: Cpu,
        className: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Git Integration",
        description: "Sync directly with your repo.",
        icon: GitBranch,
        className: "md:col-span-2 md:row-span-1",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 md:py-32 bg-black relative overflow-hidden">
            <AetherBackground
                overlayGradient="linear-gradient(180deg, #000000 0%, #000000bb 20%, #000000bb 80%, #000000 100%)"
                className="opacity-40"
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="mb-16 md:mb-24 max-w-3xl mx-auto text-center">
                    <h2 className="mb-6 text-3xl font-bold text-white sm:text-5xl md:text-6xl tracking-tight">
                        Everything you need to <span className="text-white">ship faster</span>
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
                        A complete suite of tools designed to take you from concept to code in record time.
                        Built for speed, designed for scale.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 md:gap-8 h-auto md:h-[800px]">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/30 p-8 transition-all duration-500 hover:bg-zinc-900/50",
                                feature.className
                            )}
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="mb-6">
                                    <div className="mb-6 inline-flex rounded-2xl bg-white/5 p-4 text-white shadow-inner ring-1 ring-white/10 backdrop-blur-md">
                                        <feature.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-base text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Decorative mini-visuals */}
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-auto">
                                    <div className="h-full bg-white/40 w-1/3 group-hover:w-full transition-all duration-700 ease-out" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

