"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Heart, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Section";

type LinkItem = { label: string; href: string };
type Column = { title: string; links: LinkItem[] };

const columns: Column[] = [
    {
        title: "Product",
        links: [
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "Changelog", href: "#" },
            { label: "Docs", href: "#" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Contact", href: "#" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Cookie Policy", href: "#" },
            { label: "Security", href: "#" },
        ],
    },
];

const socials: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "Twitter", href: "#", icon: Twitter },
    { label: "GitHub", href: "#", icon: Github },
    { label: "LinkedIn", href: "#", icon: Linkedin },
];

export function Footer() {
    return (
        <footer className="bg-[var(--color-nebula-bg)] nebula-hairline-t pt-20 pb-10">
            <Container>
                <div className="grid gap-12 md:grid-cols-4 mb-16">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <span className="h-8 w-8 rounded-lg bg-[var(--color-nebula-fg)] text-[var(--color-nebula-bg)] flex items-center justify-center font-bold">
                                N
                            </span>
                            <span className="text-xl font-medium text-[color:var(--color-nebula-fg)]">
                                NebulaPlan
                            </span>
                        </Link>
                        <p className="type-small mb-6 max-w-xs">
                            One home for visionary builders. Plan, build, and ship faster.
                        </p>
                        <div className="flex gap-2">
                            {socials.map((s) => (
                                <Link
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="p-2 rounded-full nebula-hairline text-[color:var(--color-nebula-fg-soft)] hover:text-[color:var(--color-nebula-fg)] transition-colors"
                                >
                                    <s.icon className="w-4 h-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {columns.map((col) => (
                        <div key={col.title}>
                            <h4 className="type-eyebrow mb-5">{col.title}</h4>
                            <ul className="space-y-3">
                                {col.links.map((l) => (
                                    <li key={l.label}>
                                        <Link
                                            href={l.href}
                                            className="text-sm text-[color:var(--color-nebula-fg-soft)] hover:text-[color:var(--color-nebula-fg)] transition-colors"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 nebula-hairline-t text-xs text-[color:var(--color-nebula-fg-mute)]">
                    <p>© {new Date().getFullYear()} NebulaPlan Inc. All rights reserved.</p>
                    <div className="flex items-center gap-1">
                        <span>Made with</span>
                        <Heart className="w-3.5 h-3.5 fill-[color:var(--color-nebula-fg)] text-[color:var(--color-nebula-fg)]" />
                        <span>by builders, for builders.</span>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
