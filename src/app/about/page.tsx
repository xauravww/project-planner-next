import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white text-black">
            <div className="container mx-auto px-6 max-w-[1200px] py-14 md:py-20">
                <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                <h1 className="type-display mt-10 text-[length:clamp(2.5rem,6vw,5rem)]">We plan it</h1>

                <div className="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-black/80">
                    <p>
                        NebulaPlan is an AI project planning app. You describe an idea in plain
                        words, and it structures the plan for you.
                    </p>
                    <p>
                        It writes requirements and user stories, maps the architecture, and builds
                        a task backlog. You keep control over every artifact.
                    </p>
                </div>

            </div>
        </div>
    );
}
