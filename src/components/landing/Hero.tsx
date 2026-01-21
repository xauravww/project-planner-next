"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-24 md:pt-32 pb-16">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="absolute top-1/4 left-1/4 h-64 w-64 md:h-96 md:w-96 rounded-full bg-blue-500/20 blur-[100px] md:blur-[128px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 md:h-96 md:w-96 rounded-full bg-purple-500/20 blur-[100px] md:blur-[128px] -z-10" />

            <div className="container relative z-10 mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-sm"
                >
                    <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
                    <span>The Future of Project Planning</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
                >
                    Plan Like a <span className="text-gradient">Visionary</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed"
                >
                    Transform your ideas into actionable plans with our AI-powered, premium project management suite. Designed for the modern builder.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
                >
                    <Link href="/signup" className="w-full sm:w-auto">
                        <Button size="lg" className="h-14 w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-semibold hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/25 rounded-xl">
                            Start Building <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="#demo" className="w-full sm:w-auto">
                        <Button variant="glass" size="lg" className="h-14 w-full sm:w-auto min-w-[200px] text-lg font-semibold rounded-xl hover:bg-white/10">
                            View Demo
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground"
                >
                    <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> No credit card required</div>
                    <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 14-day free trial</div>
                    <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Cancel anytime</div>
                </motion.div>

                {/* Dashboard Preview Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 0.7, type: "spring" }}
                    className="mt-24 relative mx-auto max-w-6xl perspective-1000 px-2 sm:px-6"
                >
                    <div className="relative rounded-2xl border border-white/10 bg-gray-900/50 p-2 sm:p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 rounded-2xl" />

                        {/* Browser Chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5 rounded-t-lg">
                            <div className="flex gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500/50" />
                                <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                                <div className="h-3 w-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="ml-4 flex-1 h-6 rounded-full bg-black/20 border border-white/5" />
                        </div>

                        <div className="aspect-[16/10] w-full overflow-hidden bg-black/80 rounded-b-lg border-x border-b border-white/5 relative group">
                            {/* Abstract UI Content */}
                            <div className="absolute top-0 left-0 w-64 bottom-0 border-r border-white/10 bg-white/5 hidden md:block p-4 space-y-4">
                                <div className="h-8 w-32 bg-white/10 rounded mb-8" />
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-10 w-full rounded-lg bg-white/5 hover:bg-white/10 transition-colors" />
                                    ))}
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 left-0 md:left-64 bottom-0 p-6 sm:p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="h-8 w-48 bg-white/10 rounded" />
                                    <div className="flex gap-4">
                                        <div className="h-8 w-8 rounded-full bg-white/10" />
                                        <div className="h-8 w-8 rounded-full bg-white/10" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-32 rounded-xl bg-white/5 border border-white/5 p-4">
                                            <div className="h-4 w-1/2 bg-white/10 rounded mb-4" />
                                            <div className="h-2 w-3/4 bg-white/5 rounded" />
                                        </div>
                                    ))}
                                </div>

                                <div className="h-64 rounded-xl bg-white/5 border border-white/5 p-6">
                                    <div className="h-4 w-1/4 bg-white/10 rounded mb-6" />
                                    <div className="flex items-end gap-4 h-40">
                                        {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
                                            <div key={i} className="flex-1 bg-blue-500/20 rounded-t-lg relative group-hover:bg-blue-500/30 transition-colors" style={{ height: `${h}%` }}>
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400/50" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Overlay Text */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] md:backdrop-blur-none md:bg-transparent pointer-events-none">
                                <div className="text-center md:hidden">
                                    <div className="text-4xl mb-2">🚀</div>
                                    <p className="text-white font-medium">Interactive Dashboard</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Reflection/Glow under the mockup */}
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 h-64 w-3/4 bg-blue-500/20 blur-[120px] -z-10" />
                </motion.div>
            </div>
        </section>
    );
}
