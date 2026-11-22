"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, X } from "lucide-react";

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
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 inset-x-0 z-50">
            <div className="container mx-auto px-4 max-w-[1400px] py-4 grid grid-cols-3 items-center">
                {/* logo */}
                <Link
                    href="/"
                    className="justify-self-start font-mono text-sm font-bold uppercase tracking-tighter border-2 border-black px-3 py-1.5"
                >
                    N
                </Link>

                {/* floating pill nav — horizontally centered */}
                <nav className="hidden md:flex justify-self-center items-center gap-1 bg-black rounded-full px-2 py-1.5">
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

                {/* right cluster: socials (desktop) + menu button (mobile, flush right) */}
                <div className="col-start-3 justify-self-end mr-3 flex items-center gap-3">
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
                    <button
                        type="button"
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className="md:hidden flex h-9 items-center gap-1.5 border-2 border-black px-3 font-mono text-xs uppercase"
                    >
                        {open && <X className="h-4 w-4" />}
                        Menu
                    </button>
                </div>
            </div>

            {/* mobile menu panel */}
            {open && (
                <div className="md:hidden absolute inset-x-0 top-full border-b-2 border-black bg-black text-white">
                    <nav className="flex flex-col">
                        {NAV.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="border-b border-white/20 px-6 py-4 font-mono text-sm uppercase tracking-tight transition-colors hover:text-[#FF4D00]"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-6 px-6 py-5">
                        {SOCIALS.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                aria-label={s.label}
                                className="font-mono text-xs uppercase text-white transition-colors hover:text-[#FF4D00]"
                            >
                                {s.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
