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
            { label: "Demo", href: "#demo" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", href: "#story" },
            { label: "How it works", href: "#how" },
            { label: "Testimonials", href: "#testimonials" },
            { label: "Contact", href: "mailto:hello@nebulaplan.app" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Sign up", href: "/signup" },
            { label: "Sign in", href: "/login" },
        ],
    },
];

const socials: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "Twitter", href: "https://x.com", icon: Twitter },
    { label: "GitHub", href: "https://github.com", icon: Github },
    { label: "LinkedIn", href: "https://www.linkedin.com", icon: Linkedin },
];

export function Footer() {
    return (
        <footer className="bg-[var(--color-nebula-bg)] pt-[var(--space-xxxl)] pb-[var(--space-xxl)]" style={{ borderTop: "1px solid var(--color-divider-soft)" }}>
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
                            <h3 className="type-eyebrow mb-5">{col.title}</h3>
                            <ul className="space-y-1">
                                {col.links.map((l) => (
                                    <li key={l.label}>
                                        <Link
                                            href={l.href}
                                            className="inline-flex items-center min-h-[44px] text-sm text-[color:var(--color-nebula-fg-soft)] hover:text-[color:var(--color-nebula-fg)] transition-colors"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-[color:var(--color-ash)]" style={{ borderTop: "1px solid var(--color-divider-soft)" }}>
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
