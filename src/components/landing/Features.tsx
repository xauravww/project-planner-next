"use client";

import { motion } from "framer-motion";
import { Layers, Zap, Shield, Globe, Cpu, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Modular Architecture",
        description: "Build scalable systems with our intuitive module planning tools. Drag, drop, and connect components.",
        icon: Layers,
        className: "md:col-span-2 md:row-span-2",
        gradient: "from-blue-500/20 to-cyan-500/20",
        border: "group-hover:border-blue-500/50",
    },
    {
        title: "Edge Optimized",
        description: "Zero-latency planning.",
        icon: Zap,
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-yellow-500/20 to-orange-500/20",
        border: "group-hover:border-yellow-500/50",
    },
    {
        title: "Global Sync",
        description: "Real-time collaboration across the globe.",
        icon: Globe,
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-purple-500/20 to-pink-500/20",
        border: "group-hover:border-purple-500/50",
    },
    {
        title: "Enterprise Security",
        description: "Bank-grade encryption for your IP.",
        icon: Shield,
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-green-500/20 to-emerald-500/20",
        border: "group-hover:border-green-500/50",
    },
    {
        title: "AI Powered",
        description: "Generative suggestions for your tech stack.",
        icon: Cpu,
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-red-500/20 to-rose-500/20",
        border: "group-hover:border-red-500/50",
    },
    {
        title: "Git Integration",
        description: "Sync directly with your repo.",
        icon: GitBranch,
        className: "md:col-span-2 md:row-span-1",
        gradient: "from-indigo-500/20 to-violet-500/20",
        border: "group-hover:border-indigo-500/50",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 md:py-32 bg-black/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-white/[0.05] -z-10" />

            <div className="container mx-auto px-4">
                <div className="mb-16 md:mb-24 max-w-3xl mx-auto text-center">
                    <h2 className="mb-6 text-3xl font-bold text-white sm:text-5xl md:text-6xl">
                        Everything you need to <span className="text-gradient">ship faster</span>
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
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
                                "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                                feature.className,
                                feature.border
                            )}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            {/* Noise Texture */}
                            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="mb-6">
                                    <div className="mb-6 inline-flex rounded-2xl bg-white/10 p-4 text-white shadow-inner ring-1 ring-white/10 backdrop-blur-md">
                                        <feature.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-base text-muted-foreground group-hover:text-gray-200 transition-colors leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Decorative mini-visuals */}
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-auto">
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
