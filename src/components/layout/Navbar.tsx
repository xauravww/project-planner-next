"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

type NavItem = { name: string; href: string };

const NAV: NavItem[] = [
    { name: "Features", href: "#features" },
    { name: "Demo", href: "#demo" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
];

const AUTH = {
    signIn: { label: "Sign In", href: "/login" },
    signUp: { label: "Get Started", href: "/signup" },
};

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { data: session, status } = useSession();
    const isLoggedIn = status === "authenticated";

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    return (
        <>
            <motion.nav
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={cn(
                    "fixed top-0 inset-x-0 z-50 transition-all h-16 flex items-center",
                    isScrolled
                        ? "bg-[var(--color-nebula-bg)]/85 backdrop-blur-md nebula-hairline-b"
                        : "bg-transparent",
                )}
                style={{ transitionDuration: "var(--nebula-fast)" }}
            >
                <div className="container mx-auto flex items-center justify-between px-6 max-w-[1200px] w-full">
                    <Link href="/" className="flex items-center gap-2 z-50">
                        <span className="h-8 w-8 rounded-lg bg-[var(--color-nebula-fg)] text-[var(--color-nebula-bg)] flex items-center justify-center font-bold">
                            N
                        </span>
                        <span className="text-lg font-medium text-[color:var(--color-nebula-fg)]">
                            NebulaPlan
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-7">
                        {NAV.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)] transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                <Link 
                                    href="/dashboard" 
                                    className="text-sm text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)] transition-colors flex items-center gap-1"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-2 pl-3 border-l border-[var(--color-nebula-hairline-strong)]">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-nebula-fg)]/10 flex items-center justify-center">
                                        <User className="w-4 h-4 text-[color:var(--color-nebula-fg)]" />
                                    </div>
                                    <span className="text-sm text-[color:var(--color-nebula-fg)]">
                                        {session?.user?.name || session?.user?.email?.split('@')[0]}
                                    </span>
                                    <button 
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="p-2 hover:bg-[var(--color-surface-elevated)] rounded-lg transition-colors ml-1"
                                        title="Sign out"
                                    >
                                        <LogOut className="w-4 h-4 text-[color:var(--color-ash)]" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href={AUTH.signIn.href} className="text-sm text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)] transition-colors">
                                    {AUTH.signIn.label}
                                </Link>
                                <Link href={AUTH.signUp.href} className="nebula-btn nebula-btn--primary">
                                    {AUTH.signUp.label}
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        aria-controls="mobile-nav"
                        className="md:hidden z-50 text-[color:var(--color-nebula-fg)] p-2"
                        onClick={() => setOpen(v => !v)}
                    >
                        {open ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            <AnimatePresence>
                {open && (
                    <motion.div
                        id="mobile-nav"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="fixed inset-0 z-40 bg-[var(--color-nebula-bg)]/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col items-center gap-8"
                    >
                        {NAV.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="type-eyebrow text-xl"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="flex flex-col w-full gap-3 max-w-xs pt-8 nebula-hairline-t">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/dashboard" onClick={() => setOpen(false)} className="nebula-btn nebula-btn--ghost justify-center flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                    <div className="flex items-center justify-center gap-2 py-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-nebula-fg)]/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-[color:var(--color-nebula-fg)]" />
                                        </div>
                                        <span className="text-sm text-[color:var(--color-nebula-fg)]">
                                            {session?.user?.name || session?.user?.email?.split('@')[0]}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => { signOut({ callbackUrl: '/' }); setOpen(false); }}
                                        className="nebula-btn nebula-btn--ghost justify-center flex items-center gap-2 text-red-400"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href={AUTH.signIn.href} onClick={() => setOpen(false)} className="nebula-btn nebula-btn--ghost justify-center">
                                        {AUTH.signIn.label}
                                    </Link>
                                    <Link href={AUTH.signUp.href} onClick={() => setOpen(false)} className="nebula-btn nebula-btn--primary justify-center">
                                        {AUTH.signUp.label}
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
