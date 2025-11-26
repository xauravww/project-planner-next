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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

interface ProjectSidebarProps {
    projectId: string;
    projectName: string;
    projectType?: string;
}

export default function ProjectSidebar({ projectId, projectName, projectType }: ProjectSidebarProps) {
    const pathname = usePathname();
    const [openCategories, setOpenCategories] = useState<string[]>(["planning"]);

    const toggleCategory = (category: string) => {
        setOpenCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    };

    const isActive = (path: string) => pathname?.includes(path);

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
        <aside className="w-64 border-r border-white/10 bg-black/20 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
                {/* Navigation */}
                <nav className="space-y-1">
                    {categories.map((category) => (
                        <div key={category.id}>
                            <Button
                                variant="ghost"
                                className="w-full justify-between text-gray-300 hover:text-white hover:bg-white/10"
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
                                                className={`w-full justify-start text-sm ${isActive(item.href)
                                                    ? "bg-white/10 text-white"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
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
            <div className="p-4 border-t border-white/10">
                <Link href={`/projects/${projectId}/settings`}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                </Link>
            </div>
        </aside>
    );
}
