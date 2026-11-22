"use client";

import { Calendar, FileText, Network, Database, Code, Workflow, Target, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { PDFExportProgress } from "./PDFExportProgress";

interface ProjectDashboardClientProps {
    project: any;
    stats: {
        requirements: number;
        workflows: number;
        userStories: number;
        mockups: number;
    };
}

export default function ProjectDashboardClient({ project, stats }: ProjectDashboardClientProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [exportId, setExportId] = useState<string | null>(null);
    const [progressData, setProgressData] = useState({ progress: 0, status: 'idle', message: 'Preparing...' });

    const handleExport = async () => {
        setIsExporting(true);
        setShowProgress(true);

        try {
            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project.id }),
            });

            if (!response.ok) throw new Error('Export failed');

            const data = await response.json();
            setExportId(data.exportId);
            pollProgress(data.exportId);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to start export. Please try again.");
            setIsExporting(false);
            setShowProgress(false);
        }
    };

    const pollProgress = async (id: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/export-pdf/progress?exportId=${id}`);
                const data = await response.json();

                setProgressData({ progress: data.progress, status: data.status, message: data.message });

                if (data.downloadReady) {
                    clearInterval(pollInterval);
                    const downloadResponse = await fetch('/api/export-pdf/progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ exportId: id }),
                    });

                    if (downloadResponse.ok) {
                        const blob = await downloadResponse.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        toast.success("Project exported successfully!");
                    } else {
                        throw new Error('Download failed');
                    }

                    setIsExporting(false);
                    setShowProgress(false);
                    setExportId(null);
                } else if (data.status === 'error') {
                    clearInterval(pollInterval);
                    toast.error("Export failed. Please try again.");
                    setIsExporting(false);
                    setShowProgress(false);
                    setExportId(null);
                }
            } catch (error) {
                console.error("Progress check error:", error);
                clearInterval(pollInterval);
                toast.error("Export failed. Please try again.");
                setIsExporting(false);
                setShowProgress(false);
                setExportId(null);
            }
        }, 1000);
    };

    const handleCancelExport = () => {
        setIsExporting(false);
        setShowProgress(false);
        setExportId(null);
        toast.info("Export cancelled");
    };

    const modules = [
        { name: "Requirements", icon: FileText, href: `/projects/${project.id}/requirements`, count: stats.requirements },
        { name: "Architecture", icon: Network, href: `/projects/${project.id}/architecture`, count: project.architecture ? 1 : 0 },
        { name: "Workflows", icon: Workflow, href: `/projects/${project.id}/workflows`, count: stats.workflows },
        { name: "User Stories", icon: Target, href: `/projects/${project.id}/stories`, count: stats.userStories },
        { name: "Tech Stack", icon: Code, href: `/projects/${project.id}/tech-stack`, count: project.techStack ? 1 : 0 },
        { name: "Mockups", icon: Database, href: `/projects/${project.id}/mockups`, count: stats.mockups },
    ];

    const facts = [
        { label: "Requirements", count: stats.requirements },
        { label: "Stories", count: stats.userStories },
        { label: "Workflows", count: stats.workflows },
        { label: "Mockups", count: stats.mockups },
    ].filter((f) => f.count > 0);

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-8">
                <PDFExportProgress
                    isOpen={showProgress}
                    onCancel={handleCancelExport}
                    projectStats={stats}
                    progressData={progressData}
                />

                {/* Header */}
                <div className="flex flex-col gap-4 border-b-2 border-black pb-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="truncate text-2xl font-semibold tracking-tight text-black">{project.name}</h1>
                        {project.description && (
                            <p className="mt-1 truncate text-sm text-black/60">{project.description}</p>
                        )}
                        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-tight text-black/50">
                            <Calendar className="mr-1 inline h-3.5 w-3.5" />
                            Created {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={isExporting}
                            className="nebula-btn nebula-btn--ghost disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            {isExporting ? 'Exporting...' : 'Export'}
                        </button>
                        <Link href={`/projects/${project.id}/refine`} className="nebula-btn nebula-btn--primary">
                            Continue planning
                        </Link>
                    </div>
                </div>

                {/* Facts strip */}
                {facts.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-3">
                        {facts.map((f) => (
                            <span
                                key={f.label}
                                className="inline-flex items-center gap-2 border-2 border-black px-3 py-1.5 font-mono text-xs uppercase tracking-tight text-black/70"
                            >
                                <span className="font-display text-base text-black">{f.count}</span>
                                {f.label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Modules — compact grid */}
                <div className="mt-6">
                    <p className="mb-3 font-mono text-xs uppercase tracking-tight text-black/60">Modules</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {modules.map((m) => (
                            <Link
                                key={m.name}
                                href={m.href}
                                className="group flex flex-col gap-2.5 border-2 border-black p-3.5 transition-colors hover:bg-black/5"
                            >
                                <span className="flex items-center justify-between">
                                    <m.icon className="h-5 w-5 text-[#FF4D00]" />
                                    <span className="font-mono text-[11px] uppercase tracking-tight text-black/50">
                                        {m.count}
                                    </span>
                                </span>
                                <span className="text-sm font-semibold text-black transition-colors group-hover:text-[#FF4D00]">
                                    {m.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
