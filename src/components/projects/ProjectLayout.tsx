"use client";

import { ReactNode } from "react";
import ProjectSidebar from "./ProjectSidebar";

interface ProjectLayoutProps {
    projectId: string;
    projectName: string;
    projectType?: string;
    children: ReactNode;
}

export default function ProjectLayout({ projectId, projectName, projectType, children }: ProjectLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden">
            <ProjectSidebar projectId={projectId} projectName={projectName} projectType={projectType} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
