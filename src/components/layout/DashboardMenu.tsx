"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { X } from "lucide-react";

export function DashboardMenu() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);

    // Project pages already have their own menu/sidebar toggle — skip the global
    // menu there to avoid two hamburger-style buttons at the same spot.
    if (pathname?.startsWith("/projects/")) {
        return null;
    }

    return (
        <>
            {/* floating menu trigger (mobile only) — an "N" mark, not a hamburger */}
            <div className="fixed right-4 top-4 z-50 md:hidden">
                <button
                    type="button"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="grid h-11 w-11 place-items-center border-2 border-black bg-white font-bold text-[#FF4D00]"
                >
                    {open ? <X className="h-5 w-5" /> : "N"}
                </button>
            </div>

            {/* mobile menu panel */}
            {open && (
                <div className="fixed inset-x-0 top-0 z-40 border-b-2 border-black bg-white md:hidden">
                    <div className="flex flex-col gap-1 px-6 pb-6 pt-24">
                        <Link
                            href="/dashboard"
                            onClick={close}
                            className="border-b border-black/15 py-3 font-mono text-sm uppercase tracking-tight text-black hover:text-[#FF4D00]"
                        >
                            Projects
                        </Link>
                        <Link
                            href="/dashboard/new"
                            onClick={close}
                            className="border-b border-black/15 py-3 font-mono text-sm uppercase tracking-tight text-black hover:text-[#FF4D00]"
                        >
                            New project
                        </Link>
                        <Link
                            href="/"
                            onClick={close}
                            className="border-b border-black/15 py-3 font-mono text-sm uppercase tracking-tight text-black hover:text-[#FF4D00]"
                        >
                            Home
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                close();
                                signOut({ callbackUrl: "/" });
                            }}
                            className="py-3 text-left font-mono text-sm uppercase tracking-tight text-[#FF4D00]"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
