"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

const NAV = [
    { name: "Work", href: "#work" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
];

const SOCIALS = [
    { label: "GitHub", href: "https://github.com", icon: Github },
    { label: "Twitter", href: "https://x.com", icon: Twitter },
    { label: "LinkedIn", href: "https://www.linkedin.com", icon: Linkedin },
];

export function KineticNav() {
    return (
        <header className="fixed top-0 inset-x-0 z-50">
            <div className="container mx-auto px-4 max-w-[1400px] py-4 flex items-center justify-between">
                {/* logo */}
                <Link href="/" className="font-mono text-sm font-bold uppercase tracking-tighter border-2 border-black px-3 py-1.5">
                    N
                </Link>

                {/* floating pill nav */}
                <nav className="hidden md:flex items-center gap-1 bg-black rounded-full px-2 py-1.5">
                    {NAV.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="px-4 py-1.5 font-mono text-xs uppercase text-white transition-colors hover:bg-white hover:text-black rounded-full"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* socials */}
                <div className="hidden md:flex items-center gap-2">
                    {SOCIALS.map((s) => (
                        <a
                            key={s.label}
                            href={s.href}
                            aria-label={s.label}
                            className="h-9 w-9 grid place-items-center border-2 border-black transition-transform hover:scale-110"
                        >
                            <s.icon className="w-4 h-4" />
                        </a>
                    ))}
                </div>

                {/* mobile menu button */}
                <button className="md:hidden h-9 px-3 border-2 border-black font-mono text-xs uppercase">
                    Menu
                </button>
            </div>
        </header>
    );
}
