"use client";

import { GlassCard } from "@/components/ui/GlassCard";
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
            color: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
            iconColor: "text-blue-400",
        },
        {
            name: "Architecture",
            icon: Network,
            href: `/projects/${project.id}/architecture`,
            count: project.architecture ? 1 : 0,
            color: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
            iconColor: "text-purple-400",
        },
        {
            name: "Workflows",
            icon: Workflow,
            href: `/projects/${project.id}/workflows`,
            count: stats.workflows,
            color: "from-green-500/20 to-green-600/20 border-green-500/30",
            iconColor: "text-green-400",
        },
        {
            name: "User Stories",
            icon: Target,
            href: `/projects/${project.id}/stories`,
            count: stats.userStories,
            color: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
            iconColor: "text-orange-400",
        },
        {
            name: "Tech Stack",
            icon: Code,
            href: `/projects/${project.id}/tech-stack`,
            count: project.techStack ? 1 : 0,
            color: "from-pink-500/20 to-pink-600/20 border-pink-500/30",
            iconColor: "text-pink-400",
        },
        {
            name: "Mockups",
            icon: Database,
            href: `/projects/${project.id}/mockups`,
            count: stats.mockups,
            color: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
            iconColor: "text-cyan-400",
        },
    ];

    return (
        <div className="space-y-6">
            {/* PDF Export Progress Modal */}
            <PDFExportProgress
                isOpen={showProgress}
                onCancel={handleCancelExport}
                projectStats={stats}
                progressData={progressData}
            />

            {/* Project Header with Export Button */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-3 flex-1 text-center lg:text-left">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">{project.name}</h1>
                    {project.description && (
                        <p className="text-gray-300 text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">{project.description}</p>
                    )}
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                        {project.projectType && (
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{project.projectType}</span>
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 shadow-lg shadow-green-500/20"
                >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export Project'}
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {modules.map((module) => (
                    <GlassCard key={module.name} className="p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                                <module.icon className={`w-6 h-6 ${module.iconColor}`} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{module.count}</div>
                                <div className="text-xs text-gray-400">{module.name}</div>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Module Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <Link key={module.name} href={module.href}>
                        <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer group">
                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <module.icon className={`w-7 h-7 ${module.iconColor}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-1">{module.name}</h3>
                                    <p className="text-sm text-gray-400">
                                        {module.count} {module.count === 1 ? "item" : "items"}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </Link>
                ))}
            </div>

            {/* Recent Activity / Overview */}
            <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Project Overview</h2>
                <div className="space-y-3 text-gray-300">
                    <p>
                        This project has <strong>{stats.requirements}</strong> requirements,{" "}
                        <strong>{stats.workflows}</strong> workflows, and{" "}
                        <strong>{stats.userStories}</strong> user stories defined.
                    </p>
                    {project.architecture && (
                        <p>Architecture documentation is available with system design and diagrams.</p>
                    )}
                    {project.techStack && (
                        <p>Technology stack has been defined for this project.</p>
                    )}
                    {stats.mockups > 0 && (
                        <p>
                            <strong>{stats.mockups}</strong> UI mockup{stats.mockups > 1 ? "s are" : " is"}{" "}
                            ready for review.
                        </p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
