"use client";

import Link from "next/link";

const SOCIAL = [
    { label: "GitHub", href: "https://github.com" },
    { label: "Twitter", href: "https://x.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com" },
    { label: "Email", href: "mailto:hello@nebulaplan.app" },
];

export function KineticFooter() {
    return (
        <footer className="border-t-2 border-black bg-white">
            <div className="container mx-auto px-4 max-w-[1400px] py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="font-mono text-xs uppercase text-black">
                    © {new Date().getFullYear()} NebulaPlan
                </div>
                <div className="flex items-center gap-6">
                    {SOCIAL.map((s) => (
                        <Link
                            key={s.label}
                            href={s.href}
                            className="font-mono text-xs uppercase text-black transition-colors hover:text-[#FF4D00]"
                        >
                            {s.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
