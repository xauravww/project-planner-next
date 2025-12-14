"use client";

import { ReactNode, useState } from "react";
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
            <main className="flex-1 overflow-y-auto">
                {/* Mobile header with menu button */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                    <h1 className="text-lg font-semibold text-white truncate">{projectName}</h1>
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
