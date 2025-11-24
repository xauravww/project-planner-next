"use client";

import { motion } from "framer-motion";
import { Lightbulb, PenTool, Rocket, ArrowDown } from "lucide-react";

const steps = [
    {
        icon: Lightbulb,
        title: "Ideate & Brainstorm",
        description: "Capture your initial thoughts and requirements with our AI-assisted brainstorming tools. Let the engine organize your chaos into structured user stories.",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
        gradient: "from-yellow-400/20 to-orange-500/20",
    },
    {
        icon: PenTool,
        title: "Design Architecture",
        description: "Structure your project with modular architecture planning and user flow diagrams. Visualize the entire system before writing a single line of code.",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
        gradient: "from-blue-400/20 to-cyan-500/20",
    },
    {
        icon: Rocket,
        title: "Launch & Scale",
        description: "Export your plan into actionable tasks and code scaffolding to kickstart development. Sync directly with your favorite project management tools.",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20",
        gradient: "from-purple-400/20 to-pink-500/20",
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            {/* Connecting Line (Desktop) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block -z-10" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-20 md:mb-32">
                    <h2 className="text-3xl font-bold text-white sm:text-5xl md:text-6xl mb-6">
                        From Concept to <span className="text-gradient">Code</span>
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        A streamlined workflow designed to turn your chaotic ideas into structured, execution-ready plans.
                    </p>
                </div>

                <div className="space-y-24 md:space-y-40">
                    {steps.map((step, index) => (
                        <div key={index} className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                            {/* Text Side */}
                            <motion.div
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="flex-1 space-y-8 relative"
                            >
                                {/* Step Number Background */}
                                <div className="absolute -top-12 -left-12 text-9xl font-bold text-white/[0.02] select-none pointer-events-none">
                                    0{index + 1}
                                </div>

                                <div className={`inline-flex p-4 rounded-2xl ${step.bg} border ${step.border} ${step.color} shadow-lg shadow-${step.color}/10`}>
                                    <step.icon className="w-8 h-8" />
                                </div>

                                <div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">{step.title}</h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Mobile Connecting Arrow */}
                                {index < steps.length - 1 && (
                                    <div className="flex justify-center md:hidden pt-8 opacity-20">
                                        <ArrowDown className="w-8 h-8 animate-bounce" />
                                    </div>
                                )}
                            </motion.div>

                            {/* Visual Side */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="flex-1 w-full"
                            >
                                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl group hover:border-white/20 transition-colors">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />

                                    {/* Grid Pattern Overlay */}
                                    <div className="absolute inset-0 bg-grid-white/[0.05]" />

                                    {/* Abstract UI Representation */}
                                    <div className="absolute inset-0 flex items-center justify-center p-8">
                                        {index === 0 && (
                                            <div className="w-full max-w-sm space-y-4">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500">AI</div>
                                                    <div className="flex-1 p-3 rounded-2xl rounded-tl-none bg-white/10 border border-white/5 text-sm text-gray-300">
                                                        Generate user stories for a SaaS platform...
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 flex-row-reverse">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500">Me</div>
                                                    <div className="flex-1 p-3 rounded-2xl rounded-tr-none bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200">
                                                        Here are 5 user stories based on your request...
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {index === 1 && (
                                            <div className="relative w-3/4 h-3/4">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-mono">Client</div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-mono">API Gateway</div>
                                                <div className="absolute bottom-0 left-0 w-24 h-12 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-xs font-mono">Auth</div>
                                                <div className="absolute bottom-0 right-0 w-24 h-12 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-mono">Database</div>

                                                {/* Connecting Lines */}
                                                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/20" style={{ strokeDasharray: "4 4" }}>
                                                    <line x1="50%" y1="20%" x2="50%" y2="40%" />
                                                    <line x1="50%" y1="60%" x2="20%" y2="85%" />
                                                    <line x1="50%" y1="60%" x2="80%" y2="85%" />
                                                </svg>
                                            </div>
                                        )}

                                        {index === 2 && (
                                            <div className="w-full h-full bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-xs text-gray-400 overflow-hidden">
                                                <div className="flex gap-2 mb-2">
                                                    <span className="text-green-400">➜</span>
                                                    <span className="text-blue-400">~/project</span>
                                                    <span className="text-white">npm run build</span>
                                                </div>
                                                <div className="space-y-1 pl-4 opacity-70">
                                                    <div>Creating an optimized production build...</div>
                                                    <div>Compiled successfully.</div>
                                                    <div className="text-green-400">✓ Route (app)                              Size     First Load JS</div>
                                                    <div>┌ ○ /                                  5.2 kB         89 kB</div>
                                                    <div>├ ○ /dashboard                         1.4 kB         76 kB</div>
                                                    <div>└ λ /api/generate                      0 kB            0 kB</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
