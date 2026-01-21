"use client";

import { motion } from "framer-motion";
import { Calendar, Users, FileText, Network, Database, Code, Workflow, Target, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useState } from "react";
import { PDFExportProgress } from "./PDFExportProgress";
import AetherBackground from "@/components/ui/aether-background";

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
            color: "bg-white/5",
            iconColor: "text-white",
        },
        {
            name: "Architecture",
            icon: Network,
            href: `/projects/${project.id}/architecture`,
            count: project.architecture ? 1 : 0,
            color: "bg-white/5",
            iconColor: "text-white",
        },
        {
            name: "Workflows",
            icon: Workflow,
            href: `/projects/${project.id}/workflows`,
            count: stats.workflows,
            color: "bg-white/5",
            iconColor: "text-white",
        },
        {
            name: "User Stories",
            icon: Target,
            href: `/projects/${project.id}/stories`,
            count: stats.userStories,
            color: "bg-white/5",
            iconColor: "text-white",
        },
        {
            name: "Tech Stack",
            icon: Code,
            href: `/projects/${project.id}/tech-stack`,
            count: project.techStack ? 1 : 0,
            color: "bg-white/5",
            iconColor: "text-white",
        },
        {
            name: "Mockups",
            icon: Database,
            href: `/projects/${project.id}/mockups`,
            count: stats.mockups,
            color: "bg-white/5",
            iconColor: "text-white",
        },
    ];

    return (
        <>
            {/* Font import (Space Grotesk) */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
            `}</style>

            <div className="relative min-h-screen" style={{ fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, -apple-system" }}>
                {/* WebGL Shader Background */}
                <div className="fixed inset-0 z-0">
                    <AetherBackground
                        overlayGradient="linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.85) 100%)"
                        className="opacity-60"
                    />
                </div>

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
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-tight" style={{ letterSpacing: '-0.02em' }}>
                                {project.name}
                            </h1>
                            {project.description && (
                                <p className="text-zinc-200 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                                    {project.description}
                                </p>
                            )}
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-xs sm:text-sm text-zinc-300">
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-md border border-white/20">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                                {project.projectType && (
                                    <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-md border border-white/20">
                                        <Users className="w-4 h-4" />
                                        <span>{project.projectType}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-white/15 hover:bg-white/25 border-2 border-white/30 backdrop-blur-md transition-all duration-300 shadow-2xl text-white font-semibold w-full sm:w-auto"
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
                                className="group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-lg p-4 sm:p-5 hover:bg-white/15 hover:border-white/30 transition-all duration-300"
                            >
                                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${module.color} flex items-center justify-center shadow-lg backdrop-blur-md border border-white/20`}>
                                        <module.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${module.iconColor}`} />
                                    </div>
                                    <div>
                                        <div className="text-2xl sm:text-3xl font-bold text-white">{module.count}</div>
                                        <div className="text-[10px] sm:text-xs text-zinc-200 uppercase tracking-wider font-medium">{module.name}</div>
                                    </div>
                                </div>
                                {/* Decorative bottom bar */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 overflow-hidden">
                                    <div className="h-full bg-white/60 w-1/3 group-hover:w-full transition-all duration-700 ease-out" />
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
                                    <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-white/20 bg-white/10 backdrop-blur-lg p-6 sm:p-7 lg:p-8 hover:bg-white/15 hover:border-white/30 transition-all duration-500 cursor-pointer h-full shadow-xl">
                                        <div className="flex items-start gap-4 sm:gap-5">
                                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg backdrop-blur-md border-2 border-white/20`}>
                                                <module.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${module.iconColor}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{module.name}</h3>
                                                <p className="text-sm sm:text-base text-zinc-200 group-hover:text-white transition-colors">
                                                    {module.count} {module.count === 1 ? "item" : "items"}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Decorative bottom bar */}
                                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-5 sm:mt-6">
                                            <div className="h-full bg-white/60 w-1/3 group-hover:w-full transition-all duration-700 ease-out" />
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
                        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-white/20 bg-white/10 backdrop-blur-lg p-6 sm:p-7 lg:p-8 shadow-xl"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Project Overview</h2>
                        <div className="space-y-3 sm:space-y-4 text-zinc-200 text-base sm:text-lg leading-relaxed">
                            <p>
                                This project has <strong className="text-white font-bold">{stats.requirements}</strong> requirements,{" "}
                                <strong className="text-white font-bold">{stats.workflows}</strong> workflows, and{" "}
                                <strong className="text-white font-bold">{stats.userStories}</strong> user stories defined.
                            </p>
                            {project.architecture && (
                                <p>Architecture documentation is available with system design and diagrams.</p>
                            )}
                            {project.techStack && (
                                <p>Technology stack has been defined for this project.</p>
                            )}
                            {stats.mockups > 0 && (
                                <p>
                                    <strong className="text-white font-bold">{stats.mockups}</strong> UI mockup{stats.mockups > 1 ? "s are" : " is"}{" "}
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
