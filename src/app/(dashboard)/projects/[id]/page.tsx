import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import { GlassCard } from "@/components/ui/GlassCard";
import { FileText, Layers, GitBranch, Users, Code, ArrowLeft, Calendar, Clock, MoreVertical, Share2, Download, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const modules = [
    { name: "Requirements", icon: FileText, href: "requirements", color: "blue", description: "Define functional & non-functional requirements", gradient: "from-blue-500/20 to-cyan-500/20" },
    { name: "Architecture", icon: Layers, href: "architecture", color: "purple", description: "Design system components & data flow", gradient: "from-purple-500/20 to-pink-500/20" },
    { name: "Workflows", icon: GitBranch, href: "workflows", color: "green", description: "Map out user journeys & process flows", gradient: "from-green-500/20 to-emerald-500/20" },
    { name: "User Stories", icon: Users, href: "stories", color: "orange", description: "Create detailed user-centric feature stories", gradient: "from-orange-500/20 to-red-500/20" },
    { name: "Tech Stack", icon: Code, href: "tech-stack", color: "cyan", description: "Select & document technology choices", gradient: "from-cyan-500/20 to-blue-500/20" },
];

export default async function ProjectDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");

    const { id } = await params;
    const result = await getProject(id);
    if (result.error || !result.project) {
        redirect("/dashboard");
    }

    const project = result.project;

    // Calculate stats
    const stats = {
        requirements: project.requirements?.length || 0,
        architecture: project.architecture ? 1 : 0,
        workflows: project.workflows?.length || 0,
        stories: project.userStories?.length || 0,
        techStack: project.techStack ? 1 : 0,
    };

    const completionPercentage = Math.round((Object.values(stats).filter(v => v > 0).length / 5) * 100);

    return (
        <div className="min-h-screen relative overflow-hidden pb-32">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[128px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[128px] -z-10" />

            <div className="container mx-auto px-4 pt-8 md:pt-12">
                {/* Navigation */}
                <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-8 group">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-2 group-hover:bg-white/10 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Dashboard
                </Link>

                {/* Project Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                                Planning Phase
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                                v1.0.0
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">{project.name}</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{project.description || "No description provided for this project."}</p>

                        <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                Created {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" />
                                Updated {new Date(project.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="glass" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                        <Button variant="glass" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/20">
                            <MessageSquare className="w-4 h-4" />
                            AI Assistant
                        </Button>
                    </div>
                </div>

                {/* Progress & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    <GlassCard className="p-6 lg:col-span-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
                        <div className="relative z-10">
                            <h3 className="text-lg font-semibold text-white mb-6">Project Progress</h3>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-4xl font-bold text-white">{completionPercentage}%</span>
                                <span className="text-sm text-muted-foreground mb-1">Completion Rate</span>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                                {Object.entries(stats).slice(0, 4).map(([key, value]) => (
                                    <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{key}</div>
                                        <div className="text-xl font-bold text-white">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Everything looks good</h3>
                            <p className="text-sm text-muted-foreground">Your project is on track. No critical issues found in the architecture.</p>
                        </div>
                    </GlassCard>
                </div>

                {/* Planning Modules Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Planning Modules</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module) => (
                            <Link key={module.href} href={`/projects/${id}/${module.href}`} className="group">
                                <GlassCard className="h-full p-6 relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-white/5 hover:border-white/10">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-12 h-12 rounded-xl bg-${module.color}-500/10 border border-${module.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                                <module.icon className={`w-6 h-6 text-${module.color}-400`} />
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowLeft className="w-5 h-5 text-white rotate-180" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{module.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-6 flex-grow">{module.description}</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-xs text-muted-foreground">
                                                {stats[module.href as keyof typeof stats] || 0} items
                                            </span>
                                            <span className={`text-xs font-medium text-${module.color}-400`}>
                                                {(stats[module.href as keyof typeof stats] || 0) > 0 ? "In Progress" : "Not Started"}
                                            </span>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
