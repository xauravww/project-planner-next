"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProjectSidebar from "./ProjectSidebar";

interface ProjectLayoutProps {
    projectId: string;
    projectName: string;
    projectType?: string;
    children: ReactNode;
}

export default function ProjectLayout({ projectId, projectName, projectType, children }: ProjectLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Get current page name from pathname
    const getCurrentPageName = () => {
        const segments = pathname.split('/');
        const lastSegment = segments[segments.length - 1];

        const pageNames: Record<string, string> = {
            '': 'Overview',
            'requirements': 'Requirements',
            'stories': 'User Stories',
            'personas': 'Personas',
            'journeys': 'User Journeys',
            'architecture': 'Architecture',
            'workflows': 'Workflows',
            'tasks': 'Tasks',
            'team': 'Team',
            'tech-stack': 'Tech Stack',
            'business-rules': 'Business Rules',
            'mockups': 'Mockups'
        };

        return pageNames[lastSegment] || 'Overview';
    };

    const currentPageName = getCurrentPageName();

    return (
        <div className="flex h-full overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-64">
                        <ProjectSidebar
                            projectId={projectId}
                            projectName={projectName}
                            projectType={projectType}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:block">
                <ProjectSidebar projectId={projectId} projectName={projectName} projectType={projectType} />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden max-w-full">
                {/* Mobile header with menu button */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                    <div className="flex items-center space-x-2">
                        <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                            <div className="h-5 w-5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                N
                            </div>
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-white font-medium truncate">{currentPageName}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="text-white hover:bg-white/10"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                {children}
            </main>
        </div>
    );
}
