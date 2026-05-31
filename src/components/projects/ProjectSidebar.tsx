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
    ArrowLeft,
    Settings,
    X,
    LayoutDashboard,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

interface ProjectSidebarProps {
    projectId: string;
    projectName: string;
    projectType?: string;
    onClose?: () => void;
}

export default function ProjectSidebar({ projectId, projectName, projectType, onClose }: ProjectSidebarProps) {
    const pathname = usePathname();
    const [openCategories, setOpenCategories] = useState<string[]>(["planning"]);

    const toggleCategory = (category: string) => {
        setOpenCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    };

    const isActive = (path: string) => pathname?.includes(path);

    // Global navigation items that could be in dock
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
            items: [
                { name: "Team Members", href: `/projects/${projectId}/team`, icon: Users },
            ],
        },
    ];

    return (
        <aside className="w-64 bg-[var(--color-nebula-bg)] flex flex-col h-full relative z-20" style={{ borderRight: "1px solid var(--color-nebula-hairline)" }}>
            {/* Mobile close button */}
            {onClose && (
                <div className="flex items-center justify-between p-4 nebula-hairline-b lg:hidden">
                    <h2 className="type-h4 truncate">{projectName}</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-[color:var(--color-nebula-fg)] hover:bg-[var(--color-surface-elevated)]"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-3">
                {/* Global Navigation */}
                <div className="mb-6">
                    <div className="type-eyebrow mb-3 px-1">Navigation</div>
                    <nav className="space-y-1">
                        {globalItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start type-small ${isActive(item.href)
                                        ? "bg-[var(--color-surface-elevated)] text-[color:var(--color-nebula-fg)]"
                                        : "text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)] hover:bg-[var(--color-nebula-surface)]"
                                        }`}
                                >
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                </Button>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="nebula-hairline-t pt-4 mb-4">
                    <div className="type-eyebrow px-1 truncate">Project: {projectName}</div>
                </div>
                {/* Navigation */}
                <nav className="space-y-1">
                    {categories.map((category) => (
                        <div key={category.id}>
                            <Button
                                variant="ghost"
                                className="w-full justify-between type-small text-[color:var(--color-nebula-fg-soft)] hover:text-[color:var(--color-nebula-fg)] hover:bg-[var(--color-nebula-surface)]"
                                onClick={() => toggleCategory(category.id)}
                            >
                                <span className="flex items-center">
                                    <category.icon className="w-4 h-4 mr-2" />
                                    {category.name}
                                </span>
                                {openCategories.includes(category.id) ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </Button>

                            {openCategories.includes(category.id) && (
                                <div className="pl-6 mt-1 space-y-1">
                                    {category.items.map((item) => (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant="ghost"
                                                className={`w-full justify-start type-small ${isActive(item.href)
                                                    ? "bg-[var(--color-surface-elevated)] text-[color:var(--color-nebula-fg)]"
                                                    : "text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)] hover:bg-[var(--color-nebula-surface)]"
                                                    }`}
                                            >
                                                <item.icon className="w-4 h-4 mr-2" />
                                                {item.name}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Settings at bottom */}
            <div className="p-3 nebula-hairline-t">
                <Link href={`/projects/${projectId}/settings`}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start type-small text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)] hover:bg-[var(--color-nebula-surface)]"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                </Link>
            </div>
        </aside>
    );
}
