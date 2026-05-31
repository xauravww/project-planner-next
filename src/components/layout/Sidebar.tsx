"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    Layers,
    GitBranch,
    Settings,
    LogOut,
    type LucideIcon,
} from "lucide-react";

type SidebarItem = { icon: LucideIcon; label: string; href: string };

const sidebarItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: FileText, label: "Requirements", href: "/dashboard/requirements" },
    { icon: Layers, label: "Architecture", href: "/dashboard/architecture" },
    { icon: GitBranch, label: "Workflows", href: "/dashboard/workflows" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--color-nebula-bg)] z-50 nebula-hairline-r"
            style={{ borderRight: "1px solid var(--color-nebula-hairline)" }}
        >
            <div className="flex h-16 items-center px-6 nebula-hairline-b">
                <span className="h-8 w-8 rounded-[var(--r-md)] bg-[var(--color-nebula-fg)] text-[var(--color-on-light)] flex items-center justify-center font-bold mr-3">
                    N
                </span>
                <span className="text-lg font-medium text-[color:var(--color-nebula-fg)]">NebulaPlan</span>
            </div>

            <nav className="flex flex-col gap-1 p-3">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-[var(--r-md)] px-3.5 py-2.5 type-small transition-colors",
                                isActive
                                    ? "bg-[var(--color-surface-elevated)] text-[color:var(--color-nebula-fg)] border border-[var(--color-nebula-hairline-strong)]"
                                    : "text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)] hover:bg-[var(--color-nebula-surface)]",
                            )}
                            style={{ transitionDuration: "var(--nebula-fast)" }}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-3 left-0 right-0 p-3">
                <button className="flex w-full items-center gap-3 rounded-[var(--r-md)] px-3.5 py-2.5 type-small text-[color:var(--color-charcoal)] hover:bg-[var(--color-nebula-surface)] hover:text-[color:var(--color-accent-red)] transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
