import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProjectLayout from "@/components/projects/ProjectLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, Users, FileText, Network, Database, Code, Workflow, Target } from "lucide-react";
import Link from "next/link";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const project = await prisma.project.findFirst({
        where: {
            id,
            userId: (session.user as any).id,
        },
        include: {
            requirements: true,
            architecture: true,
            workflows: true,
            userStories: true,
            techStack: true,
            mockups: true,
        },
    });

    if (!project) {
        redirect("/dashboard");
    }

    const stats = {
        requirements: project.requirements.length,
        workflows: project.workflows.length,
        userStories: project.userStories.length,
        mockups: project.mockups.length,
    };

    const modules = [
        {
            name: "Requirements",
            icon: FileText,
            href: `/projects/${id}/requirements`,
            count: stats.requirements,
            color: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
            iconColor: "text-blue-400",
        },
        {
            name: "Architecture",
            icon: Network,
            href: `/projects/${id}/architecture`,
            count: project.architecture ? 1 : 0,
            color: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
            iconColor: "text-purple-400",
        },
        {
            name: "Workflows",
            icon: Workflow,
            href: `/projects/${id}/workflows`,
            count: stats.workflows,
            color: "from-green-500/20 to-green-600/20 border-green-500/30",
            iconColor: "text-green-400",
        },
        {
            name: "User Stories",
            icon: Target,
            href: `/projects/${id}/stories`,
            count: stats.userStories,
            color: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
            iconColor: "text-orange-400",
        },
        {
            name: "Tech Stack",
            icon: Code,
            href: `/projects/${id}/tech-stack`,
            count: project.techStack ? 1 : 0,
            color: "from-pink-500/20 to-pink-600/20 border-pink-500/30",
            iconColor: "text-pink-400",
        },
        {
            name: "Mockups",
            icon: Database,
            href: `/projects/${id}/mockups`,
            count: stats.mockups,
            color: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
            iconColor: "text-cyan-400",
        },
    ];

    return (
        <ProjectLayout
            projectId={project.id}
            projectName={project.name}
            projectType={project.projectType || undefined}
        >
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Project Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                    {project.description && (
                        <p className="text-gray-400">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
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
        </ProjectLayout>
    );
}
