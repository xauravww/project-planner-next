import Link from "next/link";
import { ArrowLeft, Mail, Github } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white text-black">
            <div className="container mx-auto px-6 max-w-[1200px] py-14 md:py-20">
                <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                <h1 className="type-display mt-10 text-[length:clamp(2.5rem,6vw,5rem)]">Get in touch</h1>

                <div className="mt-8 max-w-2xl space-y-4 text-lg text-black/80">
                    <p>
                        Questions about NebulaPlan or your plan? Write to us and we will get back
                        to you.
                    </p>
                </div>

                <div className="mt-12 max-w-2xl border-2 border-black">
                    <div className="border-b-2 border-black p-5">
                        <div className="flex items-center gap-4">
                            <Mail className="h-5 w-5 text-[#FF4D00]" />
                            <div>
                                <div className="font-mono text-xs uppercase tracking-tight text-black/50">Email</div>
                                <a href="mailto:xauravww@gmail.com" className="font-semibold text-black transition-colors hover:text-[#FF4D00]">
                                    xauravww@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        <a
                            href="https://github.com/xauravww/project-planner-next"
                            className="inline-flex items-center gap-2 font-semibold text-black transition-colors hover:text-[#FF4D00]"
                        >
                            <Github className="h-5 w-5" />
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
