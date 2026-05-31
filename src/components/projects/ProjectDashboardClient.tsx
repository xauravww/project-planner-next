"use client";

import { motion } from "framer-motion";
import { Calendar, Users, FileText, Network, Database, Code, Workflow, Target, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
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

            // Start polling for progress
            pollProgress(data.exportId);

        } catch (error) {
            console.error("Export error:", error);
            toast.error("❌ Failed to start export. Please try again.");
            setIsExporting(false);
            setShowProgress(false);
        }
    };

    const pollProgress = async (id: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/export-pdf/progress?exportId=${id}`);
                const data = await response.json();

                setProgressData({
                    progress: data.progress,
                    status: data.status,
                    message: data.message
                });

                if (data.downloadReady) {
                    clearInterval(pollInterval);

                    // Download the PDF
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

                        toast.success("🎉 Project exported successfully!");
                    } else {
                        throw new Error('Download failed');
                    }

                    setIsExporting(false);
                    setShowProgress(false);
                    setExportId(null);

                } else if (data.status === 'error') {
                    clearInterval(pollInterval);
                    toast.error("❌ Export failed. Please try again.");
                    setIsExporting(false);
                    setShowProgress(false);
                    setExportId(null);
                }
            } catch (error) {
                console.error("Progress check error:", error);
                clearInterval(pollInterval);
                toast.error("❌ Export failed. Please try again.");
                setIsExporting(false);
                setShowProgress(false);
                setExportId(null);
            }
        }, 1000); // Poll every second
    };

    const handleCancelExport = () => {
        setIsExporting(false);
        setShowProgress(false);
        setExportId(null);
        toast.info("Export cancelled");
    };

    const modules = [
        {
            name: "Requirements",
            icon: FileText,
            href: `/projects/${project.id}/requirements`,
            count: stats.requirements,
            color: "bg-[var(--color-nebula-surface)]",
            iconColor: "text-[color:var(--color-nebula-fg)]",
        },
        {
            name: "Architecture",
            icon: Network,
            href: `/projects/${project.id}/architecture`,
            count: project.architecture ? 1 : 0,
            color: "bg-[var(--color-nebula-surface)]",
            iconColor: "text-[color:var(--color-nebula-fg)]",
        },
        {
            name: "Workflows",
            icon: Workflow,
            href: `/projects/${project.id}/workflows`,
            count: stats.workflows,
            color: "bg-[var(--color-nebula-surface)]",
            iconColor: "text-[color:var(--color-nebula-fg)]",
        },
        {
            name: "User Stories",
            icon: Target,
            href: `/projects/${project.id}/stories`,
            count: stats.userStories,
            color: "bg-[var(--color-nebula-surface)]",
            iconColor: "text-[color:var(--color-nebula-fg)]",
        },
        {
            name: "Tech Stack",
            icon: Code,
            href: `/projects/${project.id}/tech-stack`,
            count: project.techStack ? 1 : 0,
            color: "bg-[var(--color-nebula-surface)]",
            iconColor: "text-[color:var(--color-nebula-fg)]",
        },
        {
            name: "Mockups",
            icon: Database,
            href: `/projects/${project.id}/mockups`,
            count: stats.mockups,
            color: "bg-[var(--color-nebula-surface)]",
            iconColor: "text-[color:var(--color-nebula-fg)]",
        },
    ];

    return (
        <>
            {/* Font import (Space Grotesk) */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
            `}</style>

            <div className="relative min-h-screen" style={{ fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, -apple-system" }}>
                {/* Background */}
                <div className="fixed inset-0 z-0 bg-[var(--color-nebula-bg)]" />

                {/* Content with proper padding */}
                <div className="relative z-10 px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto">
                    {/* PDF Export Progress Modal */}
                    <PDFExportProgress
                        isOpen={showProgress}
                        onCancel={handleCancelExport}
                        projectStats={stats}
                        progressData={progressData}
                    />

                    {/* Project Header with Export Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6"
                    >
                        <div className="space-y-3 sm:space-y-4 flex-1 text-center lg:text-left">
                            <h1 className="type-display-lg text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight leading-tight" style={{ letterSpacing: '-0.02em' }}>
                                {project.name}
                            </h1>
                            {project.description && (
                                <p className="type-body-lg text-[color:var(--color-charcoal)] max-w-3xl mx-auto lg:mx-0">
                                    {project.description}
                                </p>
                            )}
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 type-small text-[color:var(--color-charcoal)]">
                                <div className="flex items-center gap-2 bg-[var(--color-surface-elevated)] px-3 py-2 rounded-[var(--r-md)] border border-[var(--color-nebula-hairline-strong)]">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                                {project.projectType && (
                                    <div className="flex items-center gap-2 bg-[var(--color-surface-elevated)] px-3 py-2 rounded-[var(--r-md)] border border-[var(--color-nebula-hairline-strong)]">
                                        <Users className="w-4 h-4" />
                                        <span>{project.projectType}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="nebula-ghost"
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full sm:w-auto"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Project'}
                        </Button>
                    </motion.div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                        {modules.map((module, index) => (
                            <motion.div
                                key={module.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                                className="group relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] p-4 sm:p-5 hover:bg-[var(--color-surface-elevated)] transition-all duration-300"
                            >
                                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--r-md)] ${module.color} flex items-center justify-center border border-[var(--color-nebula-hairline-strong)]`}>
                                        <module.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${module.iconColor}`} />
                                    </div>
                                    <div>
                                        <div className="type-h3 text-[color:var(--color-nebula-fg)]">{module.count}</div>
                                        <div className="type-caption uppercase tracking-wider">{module.name}</div>
                                    </div>
                                </div>
                                {/* Decorative bottom bar */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--color-nebula-hairline-strong)] overflow-hidden">
                                    <div className="h-full bg-[var(--color-nebula-fg)] w-1/3 group-hover:w-full transition-all duration-700 ease-out" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Module Navigation Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                        {modules.map((module, index) => (
                            <motion.div
                                key={module.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <Link href={module.href}>
                                    <div className="group relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] p-6 sm:p-7 lg:p-8 hover:bg-[var(--color-surface-elevated)] transition-all duration-500 cursor-pointer h-full">
                                        <div className="flex items-start gap-4 sm:gap-5">
                                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[var(--r-lg)] ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-[var(--color-nebula-hairline-strong)]`}>
                                                <module.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${module.iconColor}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="type-h3 mb-1 sm:mb-2">{module.name}</h3>
                                                <p className="type-body text-[color:var(--color-charcoal)] transition-colors">
                                                    {module.count} {module.count === 1 ? "item" : "items"}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Decorative bottom bar */}
                                        <div className="w-full h-1 bg-[var(--color-nebula-hairline-strong)] rounded-full overflow-hidden mt-5 sm:mt-6">
                                            <div className="h-full bg-[var(--color-nebula-fg)] w-1/3 group-hover:w-full transition-all duration-700 ease-out" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Project Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] p-6 sm:p-7 lg:p-8"
                    >
                        <h2 className="type-h2 mb-4 sm:mb-6">Project Overview</h2>
                        <div className="space-y-3 sm:space-y-4 type-body-lg text-[color:var(--color-charcoal)]">
                            <p>
                                This project has <strong className="text-[color:var(--color-nebula-fg)]">{stats.requirements}</strong> requirements,{" "}
                                <strong className="text-[color:var(--color-nebula-fg)]">{stats.workflows}</strong> workflows, and{" "}
                                <strong className="text-[color:var(--color-nebula-fg)]">{stats.userStories}</strong> user stories defined.
                            </p>
                            {project.architecture && (
                                <p>Architecture documentation is available with system design and diagrams.</p>
                            )}
                            {project.techStack && (
                                <p>Technology stack has been defined for this project.</p>
                            )}
                            {stats.mockups > 0 && (
                                <p>
                                    <strong className="text-[color:var(--color-nebula-fg)]">{stats.mockups}</strong> UI mockup{stats.mockups > 1 ? "s are" : " is"}{" "}
                                    ready for review.
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
