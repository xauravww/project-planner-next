"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden bg-black">
            {/* Background Glow - REMOVED for clean minimal aesthetic */}
            {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-[120px] -z-10" /> */}

            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6 tracking-tight">
                    Ready to build the <br />
                    <span className="text-white">next big thing?</span>
                </h2>
                <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                    Stop planning in scattered docs and start building with a unified, AI-powered platform.
                </p>

                <Link href="/signup">
                    <Button size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-zinc-200 border-0 transition-all duration-300">
                        Start Planning for Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
