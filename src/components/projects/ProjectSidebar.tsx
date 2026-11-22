"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronDown,
    ChevronRight,
    FileText,
    Layers,
    GitBranch,
    Users,
    Code,
    Settings,
    X,
    LayoutDashboard,
    Plus,
    Home,
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface ProjectSidebarProps {
    projectId: string;
    projectName: string;
    projectType?: string;
    onClose?: () => void;
}

export default function ProjectSidebar({ projectId, projectName, onClose }: ProjectSidebarProps) {
    const pathname = usePathname();
    const [openCategories, setOpenCategories] = useState<string[]>(["planning"]);

    const toggleCategory = (category: string) => {
        setOpenCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
        );
    };

    const isActive = (path: string) => pathname?.includes(path);

    const globalItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "New Project", href: "/dashboard/new", icon: Plus },
    ];

    const categories = [
        {
            id: "planning",
            name: "Planning",
            icon: FileText,
            items: [
                { name: "Requirements", href: `/projects/${projectId}/requirements`, icon: FileText },
                { name: "User Stories", href: `/projects/${projectId}/stories`, icon: Users },
                { name: "Personas", href: `/projects/${projectId}/personas`, icon: Users },
                { name: "User Journeys", href: `/projects/${projectId}/journeys`, icon: GitBranch },
            ],
        },
        {
            id: "design",
            name: "Design",
            icon: Layers,
            items: [
                { name: "Architecture", href: `/projects/${projectId}/architecture`, icon: Layers },
                { name: "Tech Stack", href: `/projects/${projectId}/tech-stack`, icon: Code },
                { name: "Mockups", href: `/projects/${projectId}/mockups`, icon: Layers },
            ],
        },
        {
            id: "implementation",
            name: "Implementation",
            icon: GitBranch,
            items: [
                { name: "Workflows", href: `/projects/${projectId}/workflows`, icon: GitBranch },
                { name: "Tasks", href: `/projects/${projectId}/tasks`, icon: FileText },
                { name: "Business Rules", href: `/projects/${projectId}/business-rules`, icon: FileText },
            ],
        },
        {
            id: "team",
            name: "Team",
            icon: Users,
            items: [{ name: "Team Members", href: `/projects/${projectId}/team`, icon: Users }],
        },
    ];

    return (
        <aside className="flex h-full w-64 flex-col border-r-2 border-black bg-white">
            {onClose && (
                <div className="flex items-center justify-between border-b-2 border-black p-4 lg:hidden">
                    <h2 className="truncate font-semibold text-black">{projectName}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:text-[color:var(--color-accent-orange)]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {!onClose && (
                <div className="border-b-2 border-black p-4">
                    <Link href={`/projects/${projectId}`} className="block">
                        <h2 className="truncate text-base font-semibold text-black hover:text-[color:var(--color-accent-orange)] transition-colors">
                            {projectName}
                        </h2>
                    </Link>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-3">
                <nav className="space-y-1">
                    {globalItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <span
                                className={`flex items-center gap-2 border-2 px-3 py-2 text-sm transition-colors ${
                                    isActive(item.href)
                                        ? "border-black bg-black text-white"
                                        : "border-transparent text-black hover:border-black hover:bg-black/5"
                                }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-4 border-t-2 border-black pt-4">
                    <nav className="space-y-1">
                    {categories.map((category) => (
                        <div key={category.id}>
                            <button
                                type="button"
                                onClick={() => toggleCategory(category.id)}
                                className="flex w-full items-center justify-between border-2 border-transparent px-3 py-2 text-sm text-black transition-colors hover:border-black hover:bg-black/5"
                            >
                                <span className="flex items-center gap-2">
                                    <category.icon className="h-4 w-4" />
                                    {category.name}
                                </span>
                                {openCategories.includes(category.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>

                            {openCategories.includes(category.id) && (
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-black pl-3">
                                    {category.items.map((item) => (
                                        <Link key={item.href} href={item.href}>
                                            <span
                                                className={`flex items-center gap-2 px-2 py-1.5 text-sm transition-colors ${
                                                    isActive(item.href)
                                                        ? "font-semibold text-[color:var(--color-accent-orange)]"
                                                        : "text-black/70 hover:text-black"
                                                }`}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                {item.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
            </div>

            <div className="space-y-1 border-t-2 border-black p-3">
                <Link href="/">
                    <span className="flex items-center gap-2 border-2 border-transparent px-3 py-2 text-sm text-black transition-colors hover:border-black hover:bg-black/5">
                        <Home className="h-4 w-4" />
                        Go to homepage
                    </span>
                </Link>
                <Link href={`/projects/${projectId}/settings`}>
                    <span className="flex items-center gap-2 border-2 border-transparent px-3 py-2 text-sm text-black transition-colors hover:border-black hover:bg-black/5">
                        <Settings className="h-4 w-4" />
                        Settings
                    </span>
                </Link>
                <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 border-2 border-transparent px-3 py-2 text-sm text-black transition-colors hover:border-[color:var(--color-accent-orange)] hover:text-[color:var(--color-accent-orange)]"
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
