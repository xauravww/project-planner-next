"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import AetherBackground from "@/components/ui/aether-background";

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden bg-black">
            <AetherBackground
                overlayGradient="linear-gradient(0deg, #000000 0%, #000000 20%, #000000bb 50%, #000000 100%)"
                className="opacity-60"
            />

            <div className="container mx-auto px-4 text-center relative z-10">
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
