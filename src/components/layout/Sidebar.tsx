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
    LogOut
} from "lucide-react";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: FileText, label: "Requirements", href: "/dashboard/requirements" },
    { icon: Layers, label: "Architecture", href: "/dashboard/architecture" },
    { icon: GitBranch, label: "Workflows", href: "/dashboard/workflows" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-background/50 backdrop-blur-xl">
            <div className="flex h-16 items-center px-6 border-b border-white/10">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 mr-3" />
                <span className="text-xl font-bold text-white">NebulaPlan</span>
            </div>

            <nav className="flex flex-col gap-2 p-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-4 left-0 right-0 p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-red-400 transition-all">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
